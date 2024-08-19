import { Spinner } from "@chakra-ui/react";

function Loader(){
    return(
        <div className={"loader-root"}>
            <Spinner 
            color='blue.500' 
            emptyColor='blue.900' 
            size='xl' 
            speed='0.5s'
            label='Fetching your pages...'/>
        </div> 
    )
}

export default Loader;