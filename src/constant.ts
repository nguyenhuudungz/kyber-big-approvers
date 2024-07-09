export const KYBER_ROUTER_ADDRESS = "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5";

export type Chain = {
  id: string;
  name: string;
  kyberAggregatorSubgraphUrl: string | undefined;
  rpcUrl: string;
};

export const CHAINS: Chain[] = [
  {
    id: "1",
    name: "Ethereum",
    kyberAggregatorSubgraphUrl: "https://ethereum-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-aggregator-ethereum",
    rpcUrl: "https://eth.llamarpc.com",
  },
  {
    id: "56",
    name: "BSC",
    kyberAggregatorSubgraphUrl: "https://bsc-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-aggregator-bsc",
    rpcUrl: "https://1rpc.io/bnb",
  },
  {
    id: "137",
    name: "Polygon",
    kyberAggregatorSubgraphUrl: "https://polygon-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-aggregator-polygon",
    rpcUrl: "https://polygon-bor.publicnode.com",
  },
  {
    id: "43114",
    name: "Avalanche",
    kyberAggregatorSubgraphUrl: "https://avalanche-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-aggregator-avalanche",
    rpcUrl: "https://avalanche-c-chain.publicnode.com",
  },
  {
    id: "42161",
    name: "Arbitrum",
    kyberAggregatorSubgraphUrl: "https://arbitrum-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-aggregator-arbitrum",
    rpcUrl: "https://endpoints.omniatech.io/v1/arbitrum/one/public",
  },
  {
    id: "10",
    name: "Optimism",
    kyberAggregatorSubgraphUrl: "https://optimism-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-aggregator-optimism",
    rpcUrl: "https://opt-mainnet.g.alchemy.com/v2/N7gZFcuMkhLTTpdsRLEcDXYIJssj6GsI",
  },
  {
    id: "534352",
    name: "Scroll",
    kyberAggregatorSubgraphUrl: undefined,
    rpcUrl: "https://1rpc.io/scroll",
  },
];
