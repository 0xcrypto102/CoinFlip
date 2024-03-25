const Flipping = ():JSX.Element => {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white flex flex-col gap-4">
      <div className="flex flex-col md:w-[600px] w-full items-center space-y-8 mt-6 justify-center">
        <div className="flex flex-row items-center">
          <img src='/flipping.gif' alt="coin image"></img>
        </div>
        <p className="text-3xl absolute bottom-6">Flipping...</p>
      </div>
    </div>
  );
}

export default Flipping;