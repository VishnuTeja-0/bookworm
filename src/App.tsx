import Dashboard from "./components/Dashboard"
import { ChakraBaseProvider, ChakraProvider } from "@chakra-ui/react";
//import { invoke } from "@tauri-apps/api/tauri";

function App() {

  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  //   setGreetMsg(await invoke("greet", { name }));
  // }

  return (
    <ChakraProvider>
      <Dashboard />
    </ChakraProvider>
  );
}

export default App;
