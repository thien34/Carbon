const ipfsClient = require('ipfs-http-client');

const ipfs = ipfsClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

async function uploadMetadata(metadata) {
  try {
    const { cid } = await ipfs.add(JSON.stringify(metadata));
    console.log(`CID: ${cid}`);
    return cid.toString();
  } catch (error) {
    console.error('Error uploading metadata:', error);
  }
}

const metadata = {
  name: 'Carbon Credit',
  description: 'A verified carbon credit representing 1 ton of CO2 offset.',
  image: 'ipfs://QmT78zsu7oguiKxT7g2oYfivLeCmzdBs1zjW7s8cM6H7RG',
  attributes: [
    {
      trait_type: 'Project',
      value: 'Wind Farm Project'
    },
    {
      trait_type: 'Country',
      value: 'Germany'
    },
    {
      trait_type: 'Standard',
      value: 'VCS'
    }
  ]
};

uploadMetadata(metadata);