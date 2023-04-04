// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Deploy", function () {
  // return;
  let LSSVMPairEnumerableETHAddress,
    LSSVMPairMissingEnumerableETHAddress,
    lSSVMPairEnumerableERC20Address,
    LSSVMPairMissingEnumerableERC20Address,
    LSSVMPairFactoryAddress,
    LSSVMRouterAddress,
    exponentialCurveAddress,
    linearCurveAddress,
    quadraticCurveAddress;

  //settings
  let PROTOCOL_FEE_MULTIPLIER = 0;
  let PROTOCOL_FEE_RECIPIENT = "0x1021BB533a5c04B7F9E0cE55c9C3Cd539A7aFc95";
  let ADMIN = "0x1021BB533a5c04B7F9E0cE55c9C3Cd539A7aFc95";

  it("Will deploy LSSVMPairEnumerableETH contract", async function () {
    const LSSVMPairEnumerableETH = await ethers.getContractFactory(
      "LSSVMPairEnumerableETH"
    );
    const lSSVMPairEnumerableETH = await LSSVMPairEnumerableETH.deploy();
    await lSSVMPairEnumerableETH.deployed();

    LSSVMPairEnumerableETHAddress = lSSVMPairEnumerableETH.address;
    console.log(
      "lSSVMPairEnumerableETH deployed at Address: ",
      lSSVMPairEnumerableETH.address
    );
  });

  it("Will deploy LSSVMPairMissingEnumerableETH contract", async function () {
    const LSSVMPairMissingEnumerableETH = await ethers.getContractFactory(
      "LSSVMPairMissingEnumerableETH"
    );
    const lSSVMPairMissingEnumerableETH =
      await LSSVMPairMissingEnumerableETH.deploy();
    await lSSVMPairMissingEnumerableETH.deployed();

    LSSVMPairMissingEnumerableETHAddress =
      lSSVMPairMissingEnumerableETH.address;
    console.log(
      "LSSVMPairMissingEnumerableETH deployed at Address: ",
      lSSVMPairMissingEnumerableETH.address
    );
  });

  it("Will deploy LSSVMPairEnumerableERC20 contract", async function () {
    const LSSVMPairEnumerableERC20 = await ethers.getContractFactory(
      "LSSVMPairEnumerableERC20"
    );
    const lSSVMPairEnumerableERC20 = await LSSVMPairEnumerableERC20.deploy();
    await lSSVMPairEnumerableERC20.deployed();

    lSSVMPairEnumerableERC20Address = lSSVMPairEnumerableERC20.address;
    console.log(
      "LSSVMPairEnumerableERC20 deployed at Address: ",
      lSSVMPairEnumerableERC20.address
    );
  });

  it("Will deploy LSSVMPairMissingEnumerableERC20 contract", async function () {
    const LSSVMPairMissingEnumerableERC20 = await ethers.getContractFactory(
      "LSSVMPairMissingEnumerableERC20"
    );
    const lSSVMPairMissingEnumerableERC20 =
      await LSSVMPairMissingEnumerableERC20.deploy();
    await lSSVMPairMissingEnumerableERC20.deployed();

    LSSVMPairMissingEnumerableERC20Address =
      lSSVMPairMissingEnumerableERC20.address;
    console.log(
      "LSSVMPairMissingEnumerableERC20 deployed at Address: ",
      lSSVMPairMissingEnumerableERC20.address
    );
  });

  it("Will deploy LSSVMPairFactory contract", async function () {
    const LSSVMPairFactory = await ethers.getContractFactory(
      "LSSVMPairFactory"
    );
    const lSSVMPairFactory = await LSSVMPairFactory.deploy(
      LSSVMPairEnumerableETHAddress,
      LSSVMPairMissingEnumerableETHAddress,
      lSSVMPairEnumerableERC20Address,
      LSSVMPairMissingEnumerableERC20Address,
      PROTOCOL_FEE_RECIPIENT,
      PROTOCOL_FEE_MULTIPLIER
    );
    await lSSVMPairFactory.deployed();

    LSSVMPairFactoryAddress = lSSVMPairFactory.address;
    console.log(
      "LSSVMPairFactory deployed at Address: ",
      lSSVMPairFactory.address
    );
    console.log(`constructor args: "${LSSVMPairEnumerableETHAddress}" "${LSSVMPairMissingEnumerableETHAddress}"
    "${lSSVMPairEnumerableERC20Address}" "${LSSVMPairMissingEnumerableERC20Address}" "${PROTOCOL_FEE_RECIPIENT}" "${PROTOCOL_FEE_MULTIPLIER}"`);
  });

  it("Will deploy LSSVMRouter contract", async function () {
    const LSSVMRouter = await ethers.getContractFactory("LSSVMRouter");
    const lSSVMRouter = await LSSVMRouter.deploy(LSSVMPairFactoryAddress);
    await lSSVMRouter.deployed();

    LSSVMRouterAddress = lSSVMRouter.address;
    console.log("LSSVMRouter deployed at Address: ", lSSVMRouter.address);
  });

  it("Will Whitelist router in factory", async function () {
    const LSSVMRouter = await ethers.getContractAt(
      "LSSVMPairFactory",
      LSSVMPairFactoryAddress
    );
    const setAllowed = await LSSVMRouter.setRouterAllowed(
      LSSVMRouterAddress,
      true
    );
    await setAllowed.wait();

    console.log(
      "LSSVMRouter has been whitelisted in Factory: ",
      setAllowed.hash
    );
  });

  it("Will deploy ExponentialCurve contract", async function () {
    const ExponentialCurve = await ethers.getContractFactory(
      "ExponentialCurve"
    );
    const exponentialCurve = await ExponentialCurve.deploy();
    await exponentialCurve.deployed();

    exponentialCurveAddress = exponentialCurve.address;
    console.log(
      "ExponentialCurve deployed at Address: ",
      exponentialCurve.address
    );
  });

  it("Will deploy LinearCurve contract", async function () {
    const LinearCurve = await ethers.getContractFactory("LinearCurve");
    const linearCurve = await LinearCurve.deploy();
    await linearCurve.deployed();

    linearCurveAddress = linearCurve.address;
    console.log("LinearCurve deployed at Address: ", linearCurve.address);
  });

  it("Will deploy QuadraticCurve contract", async function () {
    const QuadraticCurve = await ethers.getContractFactory("QuadraticCurve");
    const quadraticCurve = await QuadraticCurve.deploy();
    await quadraticCurve.deployed();

    quadraticCurveAddress = quadraticCurve.address;
    console.log("QuadraticCurve deployed at Address: ", quadraticCurve.address);
  });

  it("Whitelist bonding curves in factory", async function () {
    const LSSVMRouter = await ethers.getContractAt(
      "LSSVMPairFactory",
      LSSVMPairFactoryAddress
    );

    const setAllowedExponential = await LSSVMRouter.setBondingCurveAllowed(
      exponentialCurveAddress,
      true
    );
    await setAllowedExponential.wait();

    const setAllowedLinear = await LSSVMRouter.setBondingCurveAllowed(
      linearCurveAddress,
      true
    );
    await setAllowedLinear.wait();

    const setAllowedQuadratic = await LSSVMRouter.setBondingCurveAllowed(
      quadraticCurveAddress,
      true
    );
    await setAllowedQuadratic.wait();

    console.log("ExponentialCurve whitelisted at: ", setAllowedExponential.hash);
    console.log("LinearCurve whitelisted at: ", setAllowedLinear.hash);
    console.log("QuadraticCurve whitelisted at: ", setAllowedQuadratic.hash);
  });
  it("Transfer factory ownership to admin", async function () {
    const LSSVMRouter = await ethers.getContractAt(
      "LSSVMPairFactory",
      LSSVMPairFactoryAddress
    );

    const transferOwnership = await LSSVMRouter.transferOwnership(ADMIN);
    await transferOwnership.wait();
    console.log(
      "Transferred factory ownership.\nNew Owner: ",
      ADMIN,
      "\nHash: ",
      transferOwnership.hash
    );
  });
});
