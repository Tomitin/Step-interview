
export interface ManagedFund {
    key: Number,
    platform: {
      name: string
    },
    fund: {
      name: string,
      address: string
    },
    currentPerformance: string | Number,
    positionValue: {
      currentReturns: string | Number,
      fundAllocations: FundAllocation
    }
}

export interface FundAllocation {
  tokenAmount: number,
  tokenName: string,
  tokenPercentage: number
}