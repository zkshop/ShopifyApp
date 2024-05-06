import axios from 'axios';

export const XRPNftReaderClient = () => {
  return {
    getWalletNfts: async (walletAddress, identifiers) => {
      const params = {
        owner: walletAddress,
        list: 'nfts',
        issuer: identifiers.issuer,
        taxon: identifiers.nftokenTaxon,
      };
      const nfts = await axios
      .get(`https://bithomp.com/api/v2/nfts`, {
        params,
        headers: {
          'x-bithomp-token': import.meta.env.VITE_BITHOMP_TOKEN,
        },
      })
      .then(({ data }) => {
        return data.nfts;
      });
      return nfts;
    },
  };
};

export const XRPNftsReader = () => {
  return {
    getNfts: async (identifiers) => {
      const params = {
        issuer: identifiers.issuer,
        taxon: identifiers.nftokenTaxon,
      };
      const nft = await axios
      .get(`https://bithomp.com/api/v2/nfts`, {
        params,
        headers: {
          'x-bithomp-token': import.meta.env.VITE_BITHOMP_TOKEN,
        },
        })
        .then(({ data }) => {
          return data;
        });
        return nft;
      },
    };
};
