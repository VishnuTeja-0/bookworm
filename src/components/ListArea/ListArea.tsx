import {invoke} from '@tauri-apps/api/tauri';
import { Button, ButtonGroup, Accordion, AccordionItem, AccordionButton, Box, AccordionPanel, useDisclosure} from "@chakra-ui/react";
import { FaPlus, FaPencilAlt, FaExternalLinkAlt, FaTrash } from "react-icons/fa";
import './ListArea.scss';
import { IListData } from "../../models/IListData";
import { useEffect, useState } from 'react';
import PageForm from './PageForm/PageForm';

function ListArea(){
    const [isLoading, setLoading] = useState<boolean>(true);
    const [listData, setPageData] = useState<IListData[]>([]);
    const [listCategories, setCategories] = useState<string[]>([]);
    const [modalId, setModalId] = useState<number>(0); 
    const {isOpen, onOpen, onClose} = useDisclosure()

    const getListData = () => {
        invoke<[boolean, string]>('get_pages_listview')
        .then(([isSuccess, result]) => {
            if(isSuccess){
                let res : IListData[] = JSON.parse(result);
                setPageData(res);
                if(res.length > 0){
                    let categories: string[] = res.map(el => el.category);
                    setCategories(categories);
                }
                setLoading(false); 
            }
            else{
                // error alert
                console.log(result);
                alert(result);
            }
        })
        .catch((message) => {
            // error alert: call fail
            console.log(message);
            alert(message);
        });
    }

    useEffect(() => {
        getListData();
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

    const openForm = (id: number = 0) => {
        setModalId(id);
        onOpen();
    }

    const deletePage = (id: number) => {
        invoke<[boolean, string]>('delete_page', {id: id})
        .then(([isSuccess, result]) => {
            if(isSuccess){
                getListData();
                // success alert
                console.log(result);
                alert(result);
            }
            else{
                // error alert
                console.log(result);
                alert(result);
            }
        })
        .catch((error) => {
            //error alert - call fail
            console.log(error);
            alert('Error');
        })
    }

    return(
        isLoading ? 
        <></>: 
        (
        listData && listData.length == 0 ? <></> :
        <div className="listarea-root">
            <ButtonGroup>
                <Button onClick = {() => openForm()} colorScheme='green' variant='solid' size={'md'} p={3} leftIcon={<FaPlus />}>
                    <Box as='span'>{"Add Page"}</Box>
                </Button>
            </ButtonGroup>

            <PageForm 
                isOpen = {isOpen}
                onClose = {onClose} 
                id = {modalId}
                listCategories = {listCategories}
                getListData = {getListData} />

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
                                                <Button onClick={() => openForm(pageItem.id)} colorScheme='cyan' p={0} borderRadius={"20px"}><FaPencilAlt  /></Button>
                                                <Button onClick={() => deletePage(pageItem.id)} colorScheme='red' p={0} borderRadius={"20px"}><FaTrash /></Button>
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