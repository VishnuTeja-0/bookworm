import { Button, ButtonGroup } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import './ListArea.scss';

function ListArea(){
    return(
        <div className="listarea-root">
            <ButtonGroup>
                <Button colorScheme='green' variant='solid' leftIcon={<FaPlus />}>Add Page</Button>
            </ButtonGroup>
        </div>
    )
}

export default ListArea;