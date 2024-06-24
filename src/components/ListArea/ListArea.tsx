import {invoke} from '@tauri-apps/api/tauri';
import { Button, ButtonGroup, Accordion, AccordionItem, AccordionButton, Box, AccordionPanel, Card } from "@chakra-ui/react";
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

            <Accordion allowMultiple textColor={'white'} mt={4}>
                {
                    listData.map(listItem =>(
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box as='span' flex='1' textAlign='left'>{listItem.category}</Box>
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                {
                                    listItem.pageList.map(pageItem =>(
                                        <div className="page-item" data-id={pageItem.id}>
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