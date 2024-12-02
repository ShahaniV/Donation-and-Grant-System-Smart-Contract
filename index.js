import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import assessmentAbi from '../artifacts/contracts/Assessment.sol/Assessment.json';

export default function HomePage() {
  const [wallet, setWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [balance, setBalance] = useState('0');
  const [donation, setDonation] = useState('');
  const [grant, setGrant] = useState('');

  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const abi = assessmentAbi.abi;

  const initializeWallet = async () => {
    if (window.ethereum) {
      setWallet(window.ethereum);
    } else {
      alert('Please install MetaMask.');
      return;
    }

    const accounts = await wallet.request({ method: 'eth_accounts' });
    handleAccounts(accounts);
  };

  const handleAccounts = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      initializeContract();
    } else {
      console.log('No accounts found.');
      alert('Please connect your wallet.');
    }
  };

  const connectWallet = async () => {
    if (!wallet) {
      alert('Please install MetaMask.');
      return;
    }

    const accounts = await wallet.request({ method: 'eth_requestAccounts' });
    handleAccounts(accounts);
  };

  const initializeContract = () => {
    const provider = new ethers.providers.Web3Provider(wallet);
    const signer = provider.getSigner();
    const assessmentContract = new ethers.Contract(
      contractAddress,
      abi,
      signer,
    );

    setContract(assessmentContract);
    console.log('Contract initialized:', assessmentContract);
  };

  const getBalance = async () => {
    if (contract) {
      try {
        const balanceWei = await contract.getBalance(); // Fetch balance in wei
        const balanceEth = ethers.utils.formatEther(balanceWei); // Convert to ETH

        // Remove decimals, show only whole ETH
        const formattedBalance = Math.floor(parseFloat(balanceEth));
        setBalance(formattedBalance); // Update balance state with whole number
      } catch (err) {
        console.error('Error fetching balance:', err);
        alert('There was an error fetching the contract balance.');
      }
    }
  };

  const makeDonation = async () => {
    if (contract && donation) {
      try {
        console.log('Making donation:', donation);
        const tx = await contract.donate({
          value: ethers.utils.parseEther(donation),
        });
        await tx.wait();
        getBalance(); // Fetch updated balance after donation
      } catch (err) {
        console.error('Donation failed:', err);
        alert('Donation failed. Please check your input and try again.');
      }
    }
  };

  const makeGrantRequest = async () => {
    if (contract && grant) {
      try {
        console.log('Making grant request:', grant);
        const tx = await contract.requestGrant(ethers.utils.parseEther(grant));
        await tx.wait();
        getBalance(); // Fetch updated balance after grant request
      } catch (err) {
        console.error('Grant request failed:', err);
        alert('Grant request failed. Please check your input and try again.');
      }
    }
  };

  useEffect(() => {
    initializeWallet();
  }, []);

  useEffect(() => {
    if (contract) getBalance();
  }, [contract]);

  return (
    <div>
      <h1>Welcome to the Donation and Grant System!</h1>
      <h3>Support community projects by donating or requesting a grant!</h3>
      <br />
      <br />
      <br />
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected Account: {account}</p>
          <p>Contract Balance: {balance} ETH</p>

          <div>
            <h3>Donate</h3>
            <input
              type="number"
              placeholder="ETH Amount"
              value={donation}
              onChange={(e) => setDonation(e.target.value)}
            />
            <button onClick={makeDonation} className="donate-btn">
              Donate
            </button>
          </div>

          <div>
            <h3>Request Grant</h3>
            <input
              type="number"
              placeholder="ETH Amount"
              value={grant}
              onChange={(e) => setGrant(e.target.value)}
            />
            <button onClick={makeGrantRequest} className="grant-btn">
              Request Grant
            </button>
          </div>
        </div>
      )}
      <style jsx>{`
        div {
          text-align: center;
        }
        input {
          margin: 5px;
        }
        .donate-btn {
          background-color: #007bff;
          color: white;
        }
        .grant-btn {
          background-color: #ffc107;
          color: black;
        }
      `}</style>
    </div>
  );
}
