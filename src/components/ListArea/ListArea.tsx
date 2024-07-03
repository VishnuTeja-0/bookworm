import {invoke} from '@tauri-apps/api/tauri';
import { Button, ButtonGroup, Accordion, AccordionItem, AccordionButton, Box, AccordionPanel} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import './ListArea.scss';
import { IListData } from "../../models/IListData";
import { useEffect, useState } from 'react';

function ListArea(){
    const [listData, setPageData] = useState<IListData[]>([]);

    useEffect(() => {
        invoke<string>('get_pages_listview')
        .then((res) => {
            console.log(res);
            let json = JSON.parse(res);
            setPageData(json); 
        })
        .catch((message) => {
            console.log(message);
            alert(message);
        });
        
    }, [])

    return(
        listData && listData.length == 0 ? <></> :
        <div className="listarea-root">
            <ButtonGroup>
                <Button colorScheme='green' variant='solid' leftIcon={<FaPlus />}>Add Page</Button>
            </ButtonGroup>

            <Accordion className={'list'} allowMultiple textColor={'white'} mt={4}>
                {
                    listData.map(listItem =>(
                        <AccordionItem>
                                <AccordionButton className={'button'} p={4}>
                                    <Box as='span' flex='1' textAlign='left'>{listItem.category}</Box>
                                </AccordionButton>
                            <AccordionPanel className={'panel'} pb={4}>
                                {
                                    listItem.pageList.map(pageItem =>(
                                        <div className="item" data-id={pageItem.id}>
                                            {pageItem.name}
                                        </div>
                                    ))
                                }
                            </AccordionPanel>  
                        </AccordionItem>
                    ))
                }
            </Accordion>
        </div>
    )
}

export default ListArea;