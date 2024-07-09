import { ChangeEvent, useState } from "react";
import { gql, request } from "graphql-request";
import { ethers } from "ethers";
import erc20 from "./ERC20.json";
import { Chain, CHAINS, KYBER_ROUTER_ADDRESS } from "./constant";

function Kyber() {
  const [selectedChain, setSelectedChain] = useState<Chain>(CHAINS[0]);
  const [tokenAddress, setTokenAddress] = useState("0xdac17f958d2ee523a2206206994597c13d831ec7");
  const [result, setResult] = useState<any[]>([]);
  const [isFinding, setIsFinding] = useState(false);

  const onSelectChain = (e: ChangeEvent<HTMLInputElement>) => setSelectedChain(() => CHAINS.find((chain) => chain.id === e.target.value) || CHAINS[0]);

  const q1 = () => gql`
query MyQuery {
  routerSwappeds(
    orderBy: amountIn
    orderDirection: desc
    first: 1000
    where: {tokenIn: "${tokenAddress}"}
  ) {
    userAddress
  }
}
`;

  const q2 = () => gql`
query MyQuery {
  routerSwappeds(
    orderBy: amountOut
    orderDirection: desc
    first: 1000
    where: {tokenOut: "${tokenAddress}"}
  ) {
    userAddress
  }
}
`;

  const onFind = async () => {
    if (!selectedChain.kyberAggregatorSubgraphUrl) return;

    setIsFinding(true);
    setResult([]);

    try {
      const set = new Set<string>();
      let response: any;

      response = await request<any>(selectedChain.kyberAggregatorSubgraphUrl, q1());
      response.routerSwappeds.map((ele: any) => ele.userAddress).forEach((address: string) => set.add(address));
      response = await request<any>(selectedChain.kyberAggregatorSubgraphUrl, q2());
      response.routerSwappeds.map((ele: any) => ele.userAddress).forEach((address: string) => set.add(address));

      let arr = Array.from(set).map((ele) => ({
        address: ele,
        balance: BigInt(0),
      }));

      const provider = ethers.getDefaultProvider(selectedChain.rpcUrl);
      const contract = new ethers.Contract(tokenAddress, erc20, provider);

      let promises = arr.map((ele) => new Promise((resolve, reject) => resolve(contract["balanceOf"](ele.address))));
      let data: bigint[] = (await Promise.all(promises)) as bigint[];
      data.forEach((ele, i) => (arr[i].balance = ele));
      arr = arr.filter((ele, i) => arr[i].balance != 0n);
      arr.sort((a: any, b: any) => Number(b.balance - a.balance));

      promises = arr.map((ele) => new Promise((resolve, reject) => resolve(contract["allowance"](ele.address, KYBER_ROUTER_ADDRESS))));
      data = (await Promise.all(promises)) as bigint[];
      arr = arr.filter((ele, i) => data[i] >= arr[i].balance);

      setResult(arr);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFinding(false);
    }
  };

  return (
    <div>
      <h1>KYBER BIG APPROVERS</h1>
      {CHAINS.map((chain, index) => (
        <div key={index}>
          <input type="radio" name="chain" value={chain.id} onChange={onSelectChain} checked={selectedChain.id === chain.id} /> {chain.name}
        </div>
      ))}
      <div>
        Token Address
        <input type="text" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} style={{ width: "333px" }} />
      </div>
      <button onClick={onFind}>Find</button>
      <div>Result: {isFinding ? "Finding..." : ""}</div>
      {result.map((ele) => (
        <div key={ele.address}>
          {ele.address} _____________ {(ele.balance as bigint).toString(10)}
        </div>
      ))}
    </div>
  );
}

export default Kyber;
