// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.9;

import {CurveErrorCodes} from "./curveErrorCodes.sol";

interface ICurve {

    function validateDelta(uint128 delta) external pure returns (bool valid);

    function validateSpotPrice(
        uint128 newSpotPrice
    ) external view returns (bool valid);

    function getBuyInfo(
        uint128 spotPrice,
        uint128 delta,
        uint256 numItems,
        uint256 feeMultiplier,
        uint256 protocolFeeMultiplier
    )
        external
        view
        returns (
            CurveErrorCodes.Error error,
            uint128 newSpotPrice,
            uint128 newDelta,
            uint256 inputValue,
            uint256 protocolFee
        );

    function getSellInfo(
        uint128 spotPrice,
        uint128 delta,
        uint256 numItems,
        uint256 feeMultiplier,
        uint256 protocolFeeMultiplier
    )
        external
        view
        returns (
            CurveErrorCodes.Error error,
            uint128 newSpotPrice,
            uint128 newDelta,
            uint256 outputValue,
            uint256 protocolFee
        );
}
