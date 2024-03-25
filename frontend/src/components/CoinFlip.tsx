import { Icon } from "@iconify/react";

const CoinFlip = ({selectedSide, selectedAmount, balance, changeSelectedAmount, changeSelectedSide, handleStart}:any) : JSX.Element=> {
  const handleOptionSelect = (option:any) => {
    switch(option) {
      case 'HEADS':
        changeSelectedSide(option);
        break;
      case 'TAILS':
        changeSelectedSide(option);
        break;
      case '0.05': 
        changeSelectedAmount(option);
        break;
      case '0.1': 
        changeSelectedAmount(option);
        break;
      case '0.25': 
        changeSelectedAmount(option);
        break;
      case '0.5': 
        changeSelectedAmount(option);
        break;
      case '1': 
        changeSelectedAmount(option);
        break;
      default:
        changeSelectedAmount(option);
        break;
    }
  }

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white flex flex-col gap-4">
      <div className="flex flex-col md:w-[600px] w-full items-center space-y-8 mt-6 justify-center">
        <div className="flex flex-row items-center">
          <img src='/coin.png' alt="coin image"></img>
        </div>
        <div className="flex flex-col w-fit md:text-lg justify-center items-center gap-2">
          <div className="space-x-2">
            <button
              className={`${
                selectedSide === 'HEADS'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              } font-semibold py-2 px-4 rounded-lg focus:outline-none w-[100px]`}
              onClick={() => handleOptionSelect('HEADS')}
            >
              HEADS
            </button>
            <button
              className={`${
                selectedSide === 'TAILS'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              } font-semibold py-2 px-4 rounded-lg focus:outline-none w-[100px]`}
              onClick={() => handleOptionSelect('TAILS')}
            >
              TAILS
            </button>
          </div>
          <p>Selected Side: {selectedSide}</p>
        </div>
        <div className="flex flex-col w-full items-center justify-center gap-2">
          <div className="space-x-2">
            <button
              className={`${
                selectedAmount === '0.05'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              } font-semibold py-2 px-4 rounded-lg focus:outline-none w-[110px]`}
              onClick={() => handleOptionSelect('0.05')}
            >
              0.05 SOL
            </button>
            <button
              className={`${
                selectedAmount === '0.1'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              } font-semibold py-2 px-4 rounded-lg focus:outline-none w-[110px]`}
              onClick={() => handleOptionSelect('0.1')}
            >
              0.1 SOL
            </button>
            <button
              className={`${
                selectedAmount === '0.25'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              } font-semibold py-2 px-4 rounded-lg focus:outline-none w-[110px]`}
              onClick={() => handleOptionSelect('0.25')}
            >
              0.25 SOL
            </button>
          </div>
          <div className="space-x-2">
            <button
              className={`${
                selectedAmount === '0.5'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              } font-semibold py-2 px-4 rounded-lg focus:outline-none w-[110px]`}
              onClick={() => handleOptionSelect('0.5')}
            >
              0.5 SOL
            </button>
            <button
              className={`${
                selectedAmount === '1'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              } font-semibold py-2 px-4 rounded-lg focus:outline-none w-[110px]`}
              onClick={() => handleOptionSelect('1')}
            >
              1 SOL
            </button>
            <button
              className={`${
                selectedAmount === '2'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              } font-semibold py-2 px-4 rounded-lg focus:outline-none w-[110px]`}
              onClick={() => handleOptionSelect('2')}
            >
              2 SOL
            </button>
          </div>
          <p>Betting Amount: {selectedAmount}</p>
        </div>
        <p>Your balance is {balance} SOL</p>
      </div>
      <div className="flex flex-row items-center justify-center">
        <button
          className="p-3 border bg-blue-600 border-none md:text-2xl rounded-lg hover:bg-blue-800 px-10 flex flex-row items-center text-white"
          onClick={handleStart}
        >
          <Icon icon="gravity-ui:logo-telegram" className="mr-1"/> START
        </button>
      </div>
      </div>
  );
};

export default CoinFlip;
