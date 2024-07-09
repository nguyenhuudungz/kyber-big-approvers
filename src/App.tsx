import { ethers } from "ethers";
import { ChangeEvent, useState } from "react";
import { Chain, CHAINS } from "./constant";
import erc20 from "./ERC20.json";

export default function App() {
  const [addressList, setAddressList] = useState<string[]>([]);
  const [selectedChain, setSelectedChain] = useState<Chain>(CHAINS[6]);
  const onSelectChain = (e: ChangeEvent<HTMLInputElement>) => setSelectedChain(() => CHAINS.find((chain) => chain.id === e.target.value) || CHAINS[0]);
  const [token, setToken] = useState("0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4");
  const [contract, setContract] = useState("0xfd541d0e2773a189450a70f06bc7edd3c1dc9115");
  const [whaleAddress, setWhaleAddress] = useState("");
  const [isFinding, setIsFinding] = useState(false);
  const onFind = async () => {
    setWhaleAddress("");
    const list = addressList.filter((item) => item !== "");
    console.log(`list`, list);
    if (!token || !contract || list.length === 0) return;

    try {
      setIsFinding(true);
      const provider = ethers.getDefaultProvider(selectedChain.rpcUrl);
      const c = new ethers.Contract(token, erc20, provider);
      for (let i = 0; i < list.length; i++) {
        console.log(`list[i]`, list[i]);
        const response = await c.allowance(list[i], contract);
        console.log(`response`, response);
        if (response > 100000000000000000000000000000n) {
          setWhaleAddress(list[i]);
          break;
        }
      }
    } finally {
      setIsFinding(false);
    }
  };
  return (
    <>
      <h1>Big Approvers</h1>
      <div>
        <strong>Address List</strong>
      </div>
      <div>
        <a href={`https://scrollscan.com/exportData?type=tokenholders&contract=${token}`} target="_blank">go here to get the list</a>
      </div>
      <textarea style={{ height: "500px", width: "400px" }} value={addressList.join("\n")} onChange={(e) => setAddressList(e.currentTarget.value.split("\n"))} />
      {CHAINS.map((chain, index) => (
        <div key={index}>
          <input type="radio" name="chain" value={chain.id} onChange={onSelectChain} checked={selectedChain.id === chain.id} /> {chain.name}
        </div>
      ))}
      <div>
        Token Address:
        <input value={token} onChange={(e) => setToken(e.currentTarget.value)} style={{ width: "333px" }} />
      </div>
      <div>
        Contract Address:
        <input value={contract} onChange={(e) => setContract(e.currentTarget.value)} style={{ width: "333px" }} />
      </div>
      <button onClick={onFind}>Find</button>
      <div>Whale: {isFinding ? "Finding..." : whaleAddress}</div>
    </>
  );
}
