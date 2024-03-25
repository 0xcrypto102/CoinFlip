import { Icon } from "@iconify/react";

const Win = ({setResultStatus}:any): JSX.Element => {
  const handleClick = () => {
    setResultStatus();
  }
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white flex flex-col gap-4">
      <div className="flex flex-col md:w-[600px] w-full items-center space-y-8 mt-6 justify-center">
        <div className="flex flex-row items-center">
          <img src='/good.gif' alt="coin image" width={200}></img>
        </div>
        <p className="text-3xl">Congrats, You win!</p>
      </div>
      <div className="flex flex-row items-center justify-center">
        <button
          className="p-3 border bg-blue-600 border-none md:text-2xl rounded-lg hover:bg-blue-800 px-10 flex flex-row items-center text-white"
          onClick={handleClick}
        >
          <Icon icon="gravity-ui:arrow-rotate-right" className="mr-1"/> Try again
        </button>
      </div>
    </div>
  )
}

export default Win;