import React from "react";

// React Redux
import { useSelector } from "react-redux";

// Use Account Hook
import { useAccount } from "../hooks";
import { useWeb3 } from "../providers";

// react-redux
import { useDispatch } from "react-redux";

// Helper function for make capital first letter of string
const toCapitalCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// States Type
type StatesType = {
  [key: string]: {
    value: string;
    type: string;
  };
};

// Helper function for order parameters in array
const orderParams = (
  abi: any[],
  states: StatesType,
  functionName: string
): string[] => {
  const functionInputs = abi.find(
    (item: any) => item.name === functionName
  ).inputs;

  const params: string[] = [];
  functionInputs.forEach((input: any) => {
    params.push(states[input.name].value.toString());
  });

  return params;
};

const FunctionCard = (props: any) => {
  const { account } = useAccount();
  const { web3 } = useWeb3();
  const [states, setStates] = React.useState<StatesType>({});
  const [result, setResult] = React.useState<any>("");
  const { abi, address } = useSelector((state: any) => state.abi);

  const dispatch = useDispatch();

  const onChange = (elem: any, e: React.ChangeEvent<HTMLInputElement>) => {
    setStates({
      ...states,
      [e.target.name]: {
        value: e.target.value,
        type: elem.type,
      },
    });
  };

  const onClick = async () => {
    if (!props.elem.name) return;

    try {
      const contract = new web3.eth.Contract(
        abi,
        web3.utils.toChecksumAddress(address)
      );

      if (props.elem?.stateMutability === "view") {
        const params = orderParams(abi, states, props.elem.name);
        var res;
        if (params.length > 0)
          res = await contract.methods?.[props.elem.name](...params).call();
        else res = await contract.methods?.[props.elem.name]().call();
        setResult(res);
      } else {
        if (!account?.data) {
          dispatch({
            type: "SET_ERROR",
            payload:
              "Need to connect to Metamask to use this feature. Please connect to Metamask and try again.",
          });
          return;
        }
      }
    } catch (e) {
      dispatch({
        type: "SET_ERROR",
        payload:
          "Error on contract call! Please check your parameters and try again.",
      });
    }
  };

  return (
    <div className="block p-3 w-full flex-row rounded-lg border  shadow-md  bg-gray-800 border-gray-700 ">
      <p
        className="mb-2 text-md font-bold tracking-tight text-gray-900 dark:text-white"
        onClick={() => console.log(states)}
      >
        {props.elem.name !== undefined && toCapitalCase(props.elem.name)}
      </p>
      {props.elem.inputs && props.elem.inputs.length > 0 && (
        <React.Fragment>
          {props.elem.inputs.map((iElement: any, idx: number) => (
            <div key={idx} className="flex flex-col">
              <label className="text-md mb-2">
                {iElement && iElement.name !== undefined && iElement.name}
              </label>
              <input
                className="w-4/6 px-2 border-2 border-green-500 focus:outline-none bg-black text-white"
                placeholder={
                  iElement && iElement.type !== undefined && iElement.type
                }
                onChange={(e) => onChange(iElement, e)}
                name={iElement && iElement.name !== undefined && iElement.name}
              />
            </div>
          ))}
        </React.Fragment>
      )}
      <button
        className="text-green-500 bg-black w-40 rounded-sm mt-5 flex my-2"
        onClick={onClick}
      >
        <p className="m-auto text-md">Query</p>
      </button>
      {result && result.length > 0 && result}
    </div>
  );
};

export default FunctionCard;
