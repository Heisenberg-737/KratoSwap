// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.9;

import {LSSVMPairETH} from "./LSSVMPairETH.sol";
import {LSSVMPairEnumerable} from "./LSSVMPairEnumerable.sol";
import {ILSSVMPairFactoryLike} from "./ILSSVMPairFactoryLike.sol";

// An NFT/Token pair where the NFT implements ERC721Enumerable, and the token is ETH
contract LSSVMPairEnumerableETH is LSSVMPairEnumerable, LSSVMPairETH {
    // Returns the LSSVMPair type
    function pairVariant()
        public
        pure
        override
        returns (ILSSVMPairFactoryLike.PairVariant)
    {
        return ILSSVMPairFactoryLike.PairVariant.ENUMERABLE_ETH;
    }
}