import { Box, Button, FormControl, FormLabel, Input, InputGroup, InputRightAddon, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Popover, PopoverBody, PopoverContent, PopoverHeader, PopoverTrigger, Textarea } from '@chakra-ui/react';
import './PageForm.scss';
import { invoke } from '@tauri-apps/api/core';
import { FaChevronDown } from 'react-icons/fa';
import React, { useEffect, useRef, useState } from 'react';
import { IPageData } from '../../../models/IPageData';
import {useForm} from './useForm.ts'

interface PageFormProps{
    isOpen: boolean,
    onClose: () => void,
    id: number,
    listCategories: string[],
    getListData: () => void
}

function PageForm(props: PageFormProps){
    const defaultFormData = {
        name: "",
        url: "",
        description: "",
        category: ""
    }

    const {formValues, isEdited, handleFieldChange, resetForm, setFormData, FormFieldNames} = useForm(defaultFormData)
    const initialFocusRef = useRef<HTMLInputElement>(null)
    const [categorySearchList, setCategorySearchList] = useState<string[]>(props.listCategories)
    const [isOpenCategories, setOpenCategories] = useState<boolean>(false)

    const isEditMode: boolean = props.id != 0;

    useEffect(() => {
        if(isEditMode && props.isOpen){
            console.log('1');
            invoke<[boolean, string]>('get_page', {id: props.id})
            .then(([isSuccess, result]) => {
                if(isSuccess){
                    let res: IPageData = JSON.parse(result);
                    let newFormData = {
                        name: res.name,
                        url: res.url,
                        description: res.description,
                        category: res.category
                    }
                    setFormData(newFormData);
                }
                else{
                    // error alert
                    console.log(result);
                    alert(result);
                }
            })
            .catch((error) => {
                // error alert: call fail
                console.log(error);
                alert("Error");
            });
        }
    }, [props.isOpen]);

    const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let input: string = event.target.value
        handleFieldChange(FormFieldNames.CATEGORY, input);
        setCategorySearchList(props.listCategories.filter(el => el.toLowerCase().startsWith(input.toLowerCase())));
    }

    const handleSubmit = () => {
        let newPageData: IPageData = {
            ...formValues,
            id: props.id
        }
        let newPageString = JSON.stringify(newPageData);
        let callFunction = isEditMode ? 'edit_page' : 'create_page';
        let callArguments = {...(isEditMode && {id: props.id}), pageString: newPageString}
        invoke<[boolean, string]>(callFunction, callArguments)
        .then(([isSuccess, result]) => {
            if(isSuccess){
                props.getListData();
                // success alert
                console.log(result);
                alert(result);

                onModalClose();
            }
            else{
                // error alert
                console.log(result);
                alert(result);
            }
        })
        .catch((message) => {
            // error alert: call fail
            onModalClose();
            console.log(message);
            alert("Error");
        })
    }

    const onModalClose = () => {
        setFormData(defaultFormData);
        props.onClose();
    }

    return(
        <Modal isOpen = {props.isOpen} onClose = {onModalClose}>
            <ModalOverlay />
            <ModalContent className={"modal-form"}>
                <ModalHeader>Page Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <div className={"page-form"}>

                        <FormControl className={'form-field'} isRequired>
                            <FormLabel className={'form-field-label'}>Name</FormLabel>
                            <Input 
                                type = "text"
                                className={'form-field-input'}
                                placeholder = "Ex. Project Ideas, Tasks"
                                value = {formValues[FormFieldNames.NAME]}
                                onChange = {(e) => handleFieldChange(FormFieldNames.NAME, e.target.value)}/>
                        </FormControl>

                        <FormControl className={'form-field'} isRequired>
                            <FormLabel className={'form-field-label'}>URL Link</FormLabel>
                            <Input 
                                type = "text"
                                className={'form-field-input'} 
                                placeholder = "Ex. https://google.com"
                                value = {formValues[FormFieldNames.URL]}
                                onChange = {(e) => handleFieldChange(FormFieldNames.URL, e.target.value)} />
                        </FormControl>

                        <FormControl className={'form-field'}>
                            <FormLabel className={'form-field-label'}>Description</FormLabel>
                            <Textarea 
                                placeholder = "This is what the link is for..."
                                className={'form-field-input'}
                                value = {formValues[FormFieldNames.DESCRIPTION]}
                                onChange = {(e) => handleFieldChange(FormFieldNames.DESCRIPTION,e.target.value)} />
                        </FormControl>

                        <FormControl className={'form-field'} isRequired>
                            <FormLabel className={'form-field-label'}>Category</FormLabel>                        
                                <Popover
                                    initialFocusRef={initialFocusRef}
                                    placement = 'bottom'
                                    matchWidth = {true}
                                    isLazy = {true}
                                    isOpen = {
                                        isOpenCategories && 
                                        (
                                            categorySearchList.length > 1 ||
                                            (
                                                categorySearchList.length == 1 &&
                                                categorySearchList[0] !== formValues[FormFieldNames.CATEGORY]
                                            )
                                        )
                                    }>
                                    <PopoverTrigger>
                                        <InputGroup>
                                            <Input 
                                                type = "text" 
                                                className={'form-field-input'}
                                                borderRight={'none'}
                                                placeholder= 'Enter page category or...'
                                                onChange={handleCategoryChange}
                                                value={formValues[FormFieldNames.CATEGORY]}
                                                ref={initialFocusRef}
                                                onFocus={() => setOpenCategories(true)}
                                                onBlur={() => setOpenCategories(false)}
                                                />
                                            <InputRightAddon
                                                bgColor={'rgba(0, 0, 0, 0)'}
                                                className={'form-field-input'}
                                                color={'rgba(255, 255, 255, 0.3)'}
                                                borderLeft={'none'}
                                                onClick={() => setOpenCategories(!isOpenCategories)}>
                                                    <FaChevronDown />
                                            </InputRightAddon>
                                        </InputGroup>
                                    </PopoverTrigger>
                                    <PopoverContent className={'category-list'}>
                                        <PopoverHeader borderBottom={'2px'} borderColor={'gray.200'}>
                                            {"Select existing category"}
                                        </PopoverHeader>
                                        <PopoverBody 
                                            maxHeight={'175px'}
                                            overflowY={'scroll'}>
                                            {
                                                categorySearchList.map(category => (
                                                    <Box className={'category-item'} 
                                                        p={2}
                                                        m={1}  
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleFieldChange(FormFieldNames.CATEGORY, category);
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
                <ModalFooter pt={6}>
                    <Button colorScheme='pink' variant='solid' size={'sm'} p={3} ml={2}
                            isDisabled = {!isEdited}
                            onClick = {resetForm}>
                        <Box as='span'>{"Reset Changes"}</Box>
                    </Button>
                    <Button colorScheme='blue' variant='solid' size={'sm'} p={3} ml={2}
                            isDisabled = {!isEdited}
                            onClick = {handleSubmit}>
                        <Box as='span'>{"Submit"}</Box>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default PageForm;