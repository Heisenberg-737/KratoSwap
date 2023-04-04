// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.9;

import {ICurve} from "./ICurve.sol";
import {CurveErrorCodes} from "./curveErrorCodes.sol";
import {FixedPointMathLib} from "@rari-capital/solmate/src/utils/FixedPointMathLib.sol";

// Bonding curve logic for a quadratic curve, where each buy/sell changes spot price by adding/substracting delta
contract QuadraticCurve is ICurve, CurveErrorCodes {
    using FixedPointMathLib for uint256;

    function validateDelta(
        uint128 /*delta*/
    ) external pure override returns (bool valid) {
        // For a quadratic curve, all values of delta are valid
        return true;
    }

    function validateSpotPrice(
        uint128 /* newSpotPrice */
    ) external pure override returns (bool) {
        // For a quadratic curve, all values of spot price are valid
        return true;
    }

    function getBuyInfo(
        uint128 spotPrice,
        uint128 delta,
        uint256 numItems,
        uint256 feeMultiplier,
        uint256 protocolFeeMultiplier
    )
        external
        pure
        override
        returns (
            Error error,
            uint128 newSpotPrice,
            uint128 newDelta,
            uint256 inputValue,
            uint256 protocolFee
        )
    {
        // We only calculate changes for buying 1 or more NFTs
        if (numItems == 0) {
            return (Error.INVALID_NUMITEMS, 0, 0, 0, 0);
        }

        // For a quadratic curve, the spot price increases quadratically for each item bought
        // New spot price = previous spot price + delta * (2 * numItems - 1)
        uint256 newSpotPrice_ = spotPrice + delta * (2 * numItems - 1);
        if (newSpotPrice_ > type(uint128).max) {
            return (Error.SPOT_PRICE_OVERFLOW, 0, 0, 0, 0);
        }
        newSpotPrice = uint128(newSpotPrice_);

        // Spot price is assumed to be the instant sell price. To avoid arbitraging LPs, we adjust the buy price upwards.
        // If spot price for buy and sell were the same, then someone could buy 1 NFT and then sell for immediate profit.
        // EX: Let S be spot price. Then buying 1 NFT costs S ETH, now new spot price is (S+delta).
        // The same person could then sell for (S+delta) ETH, netting them delta ETH profit.
        // If spot price for buy and sell differ by delta, then buying costs (S+delta) ETH.
        // The new spot price would become (S+delta), so selling would also yield (S+delta) ETH.
        uint256 buySpotPrice = spotPrice + delta;

        // If we buy n items, then the total cost is equal to:
        // (buy spot price + (2 * delta)) + (buy spot price + (4 * delta)) + (buy spot price + (6 * delta)) + ... + (buy spot price + (2 * (n - 1) * delta))
        // This is equal to n*(buy spot price + (n - 1) * delta) + (delta^2) * (n * (n - 1) * (2 * n - 1)) / 6
        // because we have n instances of buy spot price plus 1 to n-1 instances of delta added to it, and then we sum up from delta^2 to (2 * (n-1) * delta)^2
        inputValue =
            numItems *
            (buySpotPrice + (numItems - 1) * delta) +
            (delta * delta * numItems * (numItems - 1) * (2 * numItems - 1)) /
            6;

        // Account for the protocol fee, a flat percentage of the buy amount
        protocolFee = inputValue.fmul(
            protocolFeeMultiplier,
            FixedPointMathLib.WAD
        );

        // Account for the trade fee, only for Trade pools
        inputValue += inputValue.fmul(feeMultiplier, FixedPointMathLib.WAD);

        // Add the protocol fee to the required input amount
        inputValue += protocolFee;

        // Keep delta the same
        newDelta = delta;

        // If we got all the way here, no math error happened
        error = Error.OK;
    }

    function getSellInfo(
        uint128 spotPrice,
        uint128 delta,
        uint256 numItems,
        uint256 feeMultiplier,
        uint256 protocolFeeMultiplier
    )
        external
        pure
        override
        returns (
            Error error,
            uint128 newSpotPrice,
            uint128 newDelta,
            uint256 outputValue,
            uint256 protocolFee
        )
    {
        // We only calculate changes for selling 1 or more NFTs
        if (numItems == 0) {
            return (Error.INVALID_NUMITEMS, 0, 0, 0, 0);
        }

        // We first calculate the change in spot price after selling all of the items
        uint256 totalPriceDecrease = delta * numItems * numItems;

        // If the current spot price is less than the total amount that the spot price should change by...
        if (spotPrice < totalPriceDecrease) {
            // Then we set the new spot price to be 0. (Spot price is never negative)
            newSpotPrice = 0;

            // We calculate how many items we can sell into the quadratic curve until the spot price reaches 0, rounding up
            uint256 numItemsTillZeroPrice = FixedPointMathLib.sqrt(spotPrice / delta) + 1;
            numItems = numItemsTillZeroPrice;
        }
        // Otherwise, the current spot price is greater than or equal to the total amount that the spot price changes
        // Thus we don't need to calculate the maximum number of items until we reach zero spot price, so we don't modify numItems
        else {
            // The new spot price is just the change between spot price and the total price change
            newSpotPrice = spotPrice - uint128(totalPriceDecrease);
        }

        // If we sell n items, then the total sale amount is:
        // (spot price) + (spot price - 1^2 * delta) + (spot price - 2^2 * delta) + ... + (spot price - (n-1)^2 * delta)
        // This is equal to n*(spot price) - (delta)*(n*(n-1)*(2*n-1))/6
        outputValue = numItems * spotPrice - (delta * numItems * (numItems - 1) * (2 * numItems - 1)) / 6;

        // Account for the protocol fee, a flat percentage of the sell amount
        protocolFee = outputValue.fmul(
            protocolFeeMultiplier,
            FixedPointMathLib.WAD
        );

        // Account for the trade fee, only for Trade pools
        outputValue -= outputValue.fmul(feeMultiplier, FixedPointMathLib.WAD);

        // Subtract the protocol fee from the output amount to the seller
        outputValue -= protocolFee;

        // Keep delta the same
        newDelta = delta;

        // If we reached here, no math errors
        error = Error.OK;
    }
}
