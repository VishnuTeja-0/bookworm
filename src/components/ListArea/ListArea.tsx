import {invoke} from '@tauri-apps/api/tauri';
import { Button, ButtonGroup, Accordion, AccordionItem, AccordionButton, Box, AccordionPanel} from "@chakra-ui/react";
import { FaPlus, FaPencilAlt, FaExternalLinkAlt, FaTrash } from "react-icons/fa";
import './ListArea.scss';
import { IListData } from "../../models/IListData";
import { useEffect, useState } from 'react';

function ListArea(){
    const [isLoading, setLoading] = useState<boolean>(true);
    const [listData, setPageData] = useState<IListData[]>([]);

    useEffect(() => {
        invoke<string>('get_pages_listview')
        .then((res) => {
            console.log(res);
            let json = JSON.parse(res);
            setPageData(json);
            setLoading(false); 
        })
        .catch((message) => {
            // error alert
            console.log(message);
            alert(message);
        });
        
    }, [])

    const openBrowserWindow = (linkString: string, isUrl: boolean) => {
        invoke<string>('open_browser_window', {linkString: linkString, isUrl: isUrl})
        .then((res) => {
            console.log(res);
        })
        .catch((message) => {
            //error alert
            console.log(message);
            alert(message);
        })
    }

    return(
        isLoading ? 
        <></>: 
        (
        listData && listData.length == 0 ? <></> :
        <div className="listarea-root">
            <ButtonGroup>
                <Button colorScheme='green' variant='solid' size={'md'} p={3} leftIcon={<FaPlus />}><Box as='span' pt={"4%"}>Add Page</Box></Button>
            </ButtonGroup>

            <Accordion className={'list'} allowMultiple textColor={'white'} mt={4}>
                {
                    listData.map(listItem =>(
                        <AccordionItem>
                                <AccordionButton className={'button'} p={4}>
                                    <Box as='span' flex='1' textAlign='left'>{listItem.category}</Box>

                                    <ButtonGroup className='header-buttons'>
                                        <Button colorScheme='teal' variant='solid' p={0} size='xs' borderRadius={"20px"}
                                            onClick={(e) => {openBrowserWindow(listItem.category, false); e.preventDefault();}}
                                        ><FaExternalLinkAlt /></Button>
                                    </ButtonGroup>
                                </AccordionButton>
                            <AccordionPanel className={'panel'}>
                                {
                                    listItem.pageList.map(pageItem =>(
                                        <Box className="item" data-id={pageItem.id} display='flex' justifyContent='space-between'>
                                            <span>{pageItem.name}</span>

                                            <ButtonGroup className='item-buttons' variant='outline' size='xs'>
                                                <Button colorScheme='teal' p={0} borderRadius={"20px"} 
                                                    onClick={() => openBrowserWindow(pageItem.url, true)}>
                                                    <FaExternalLinkAlt />
                                                </Button>
                                                <Button colorScheme='cyan' p={0} borderRadius={"20px"}><FaPencilAlt  /></Button>
                                                <Button colorScheme='red' p={0} borderRadius={"20px"}><FaTrash /></Button>
                                            </ButtonGroup>
                                        </Box>
                                    ))
                                }
                            </AccordionPanel>  
                        </AccordionItem>
                    ))
                }
            </Accordion>
        </div>
        )
    )
}

export default ListArea;