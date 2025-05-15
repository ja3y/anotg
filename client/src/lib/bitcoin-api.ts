import axios from "axios";

export const fetchWalletData = async (address: string) => {
  const response = await axios.get(`/api/wallet/${address}`);
  return response.data;
};

export const fetchTransactions = async (address: string, page: number = 1, limit: number = 10) => {
  const response = await axios.get(`/api/wallet/${address}/transactions`, {
    params: { page, limit }
  });
  return response.data;
};

export const fetchRelatedWallets = async (address: string) => {
  const response = await axios.get(`/api/wallet/${address}/related`);
  return response.data;
};

export const submitWalletRating = async (address: string, rating: number, comment?: string) => {
  const response = await axios.post(`/api/wallet/${address}/rate`, { rating, comment });
  return response.data;
};

export const flagWallet = async (address: string, reason: string) => {
  const response = await axios.post(`/api/wallet/${address}/flag`, { reason });
  return response.data;
};
