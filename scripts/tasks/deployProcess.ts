import { task } from "hardhat/config"
import { readFileSync, writeFileSync } from "../helpers/pathHelper"

task("deploy:member", "Deploy member")
  .addFlag("verify", "Validate contract after deploy")
  .setAction(async ({ verify }, hre) => {
    await hre.run("compile")
    const [signer]: any = await hre.ethers.getSigners()
    const feeData = await hre.ethers.provider.getFeeData()
    const XueDAOFactory = await hre.ethers.getContractFactory("contracts/membership.sol:XueDAO_Contract_Template", )
    const tokenURI = "https://xuedaoisgood.com/"
    const XueDAODeployContract: any = await XueDAOFactory.connect(signer).deploy(tokenURI , {
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      maxFeePerGas: feeData.maxFeePerGas,
      gasLimit: 6000000, // optional: for some weird infra network
    })

    const address = {
      main: XueDAODeployContract.address,
    }
    const addressData = JSON.stringify(address)
    writeFileSync(`scripts/address/${hre.network.name}/`, "XueDAO.json", addressData)
    console.log(`XueDAO Contract deployed at ${XueDAODeployContract.address}`)

    await XueDAODeployContract.deployed()

    if (verify) {
      console.log("verifying contract...")
      await XueDAODeployContract.deployTransaction.wait(3)
      try {
        await hre.run("verify:verify", {
          address: XueDAODeployContract.address,
          constructorArguments: [tokenURI],
          contract: "contracts/membership.sol:XueDAO_Contract_Template",
        })
      } catch (e) {
        console.log(e)
      }
    } 
  },
  )
