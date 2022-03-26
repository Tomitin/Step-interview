// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address } = req.query;

  try {
    const fundData = await axios.get(`https://capitalfund-api-1-8ftn8.ondigitalocean.app/fund/${address}/decentralised`)
    res.status(200).json({ data: fundData.data })
  } catch(err) {
    res.status(200).json({ data: null })
  }
}
