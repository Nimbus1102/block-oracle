import React from 'react'
import { ethers } from "ethers";
import { notification } from 'antd';

import Notify from 'bnc-notify'


export default function Transactor(provider,etherscan) {
  if(typeof provider != "undefined"){
    let signer = provider.getSigner()
    return async (tx) => {

      const network = await provider.getNetwork()
      console.log("network",network)
      const options = {
        dappId: "17422c49-c723-41e7-85dd-950f5831ef92",
        networkId: network.chainId,
        //darkMode: Boolean, // (default: false)
        transactionHandler: (txInformation)=>{
          console.log("HANDLE TX",txInformation)
        },
      }
      const notify = Notify(options)

      let etherscanNetwork = ""
      if(network.name && network.chainId > 1){
        etherscanNetwork = network.name+"."
      }

      const etherscanTxUrl = "https://"+etherscanNetwork+"etherscan.io/tx/"

      try{
        let result
        if(tx instanceof Promise){
          result = await tx
        }else{
          result = await signer.sendTransaction(tx);
        }
        console.log("RESULT:",result)
        console.log("Notify",notify)

        //if it is a valid Notify.js network, use that, if not, just send a default notification
        if([1,3,4,5,42].indexOf(network.chainId)>=0){
          const { emitter } = notify.hash(result.hash)
          emitter.on('all', (transaction) => {
            return {
              onclick: () =>
              window.open((etherscan?etherscan:etherscanTxUrl)+transaction.hash),
            }
          })
        }else{
          notification['info']({
            message: 'Local Transaction Sent',
            description: result.hash,
            placement:"bottomRight"
          });
        }

      }catch(e){
        console.log(e)
        console.log("Transaction Error:",e.message)
        notification['error']({
          message: 'Transaction Error',
          description: e.message
        });
      }
    }

  }
}
