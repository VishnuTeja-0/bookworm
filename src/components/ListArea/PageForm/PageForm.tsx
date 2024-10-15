import { Box, Button, FormControl, FormLabel, Input, InputGroup, InputRightAddon, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Popover, PopoverBody, PopoverContent, PopoverHeader, PopoverTrigger, Textarea, useDisclosure } from '@chakra-ui/react';
import './PageForm.scss';
import { invoke } from '@tauri-apps/api/tauri';
import { IListData } from '../../../models/IListData';
import { FaChevronDown } from 'react-icons/fa';
import React, { useEffect, useRef, useState } from 'react';
import { IPageData } from '../../../models/IPageData';

interface PageFormProps{
    isOpen: boolean,
    onClose: () => void,
    id: number,
    listData: IListData[],
    listCategories: string[],
    getListData: () => void
}

function PageForm(props: PageFormProps){
    const [nameValue, setNameValue] = useState<string>("")
    const [urlValue, setUrlValue] = useState<string>("")
    const [descriptionValue, setDescriptionValue] = useState<string>("")
    const [categoryValue, setCategoryValue] = useState<string>("")
    const initialFocusRef = useRef<HTMLInputElement>(null)
    const [categorySearchList, setCategorySearchList] = useState<string[]>(props.listCategories)
    const [isOpenCategories, setOpenCategories] = useState<boolean>(false)

    const isEditMode: boolean = props.id != 0;

    useEffect(() => {
        if(isEditMode){
            invoke<string>('get_page', {id: props.id})
            .then((json) => {
                let res: IPageData = JSON.parse(json);

            })
            .catch((message) => {
                // error alert
                console.log(message);
                alert(message);
            });
        }
    }, [])

    const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let input: string = event.target.value
        setCategoryValue(input);
        setCategorySearchList(props.listCategories.filter(el => el.startsWith(input)));
    }

    return(
        <Modal isOpen = {props.isOpen} onClose = {props.onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Page Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <div className={"page-form"}>

                        <FormControl className={'form-field'} isRequired>
                            <FormLabel className={'form-field-label'}>Name</FormLabel>
                            <Input 
                                type = "text"
                                placeholder = "Ex. Project Ideas, Tasks"
                                value = {nameValue}
                                onChange = {(e) => setNameValue(e.target.value)}/>
                        </FormControl>

                        <FormControl className={'form-field'} isRequired>
                            <FormLabel className={'form-field-label'}>URL Link</FormLabel>
                            <Input 
                                type = "text" 
                                placeholder = "Ex. https://google.com"
                                value = {urlValue}
                                onChange = {(e) => setUrlValue(e.target.value)} />
                        </FormControl>

                        <FormControl className={'form-field'}>
                            <FormLabel className={'form-field-label'}>Description</FormLabel>
                            <Textarea 
                                placeholder = "This is what the link is for..."
                                value = {descriptionValue}
                                onChange = {(e) => setDescriptionValue(e.target.value)} />
                        </FormControl>

                        <FormControl className={'form-field'} isRequired>
                            <FormLabel className={'form-field-label'}>Category</FormLabel>                        
                                <Popover
                                    initialFocusRef={initialFocusRef}
                                    placement='bottom'
                                    matchWidth = {true}
                                    isLazy = {true}
                                    isOpen = {isOpenCategories && categorySearchList.length > 1}>
                                    <PopoverTrigger>
                                        <InputGroup>
                                            <Input 
                                                type = "text" 
                                                placeholder= 'Enter page category or...'
                                                onChange={handleCategoryChange}
                                                value={categoryValue}
                                                ref={initialFocusRef}
                                                onFocus={() => setOpenCategories(true)}
                                                onBlur={() => setOpenCategories(false)}
                                                />
                                            <InputRightAddon
                                                onClick={() => setOpenCategories(!isOpenCategories)}>
                                                    <FaChevronDown />
                                            </InputRightAddon>
                                        </InputGroup>
                                    </PopoverTrigger>
                                    <PopoverContent className={'category-list'}>
                                        <PopoverHeader borderBottom={'2px'} borderColor={'gray.200'}>
                                            {"Select existing category"}
                                        </PopoverHeader>
                                        <PopoverBody>
                                            {
                                                categorySearchList.map(category => (
                                                    <Box className={'category-item'} 
                                                        p={2} 
                                                        borderBottom={"1px"} 
                                                        onClick={() => {
                                                            setCategoryValue(category);
                                                            setCategorySearchList([category])
                                                        }}>
                                                            {category}
                                                    </Box>
                                                ))
                                            }
                                        </PopoverBody>
                                    </PopoverContent>
                                </Popover>
                        </FormControl>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='pink' variant='solid' size={'sm'} p={3} ml={2}
                            isDisabled = {!isEdited}
                            onClick = {handleReset}>
                        <Box as='span' pt={1}>{"Reset Changes"}</Box>
                    </Button>
                    <Button colorScheme='blue' variant='solid' size={'sm'} p={3} ml={2}
                            isDisabled = {!isEdited}
                            onClick = {handleSubmit}>
                        <Box as='span' pt={1}>{"Submit"}</Box>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default PageForm;