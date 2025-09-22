import { useEffect, useState } from "react";
import { IPageData } from "../../models/IPageData";
import './Info.scss';
import { Button, Card, CardBody, CardHeader, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Heading, Link, useDisclosure } from "@chakra-ui/react";
import { FaExternalLinkAlt } from "react-icons/fa";

function Info(props: {activePage: IPageData}){
    const [isPageActive, setIsPageActive] = useState<boolean>(false);
    const {isOpen, onOpen, onClose} = useDisclosure();

    useEffect(() => {
        let isPageActive: boolean = JSON.stringify(props.activePage) !== "{}";
        setIsPageActive(isPageActive);
    }, [props.activePage])

    return(
        <div className={"info-root"}>
            <div className={"preview"}>

            </div>
            <div className={"summary"} hidden={!isPageActive}>
                <Card className={"detail-card"} width={'100%'} color={'white'} 
                      size='sm' p={2} boxShadow={"2px 2px 4px 2px black inset, -2px -2px 4px 2px black inset"}>
                    <CardHeader py={1}>
                        <Heading size='sm'>Details</Heading>
                    </CardHeader>
                    <CardBody>
                        <div className={"detail-field"}>
                            <span className={"detail-heading"}>NAME:</span>
                            <span className={"detail-data"}>{props.activePage.name}</span>
                        </div>
                        <div className={"detail-field"}>
                            <span className={"detail-heading"}>LINK:</span>
                            <span className={"detail-data"}>
                                <Link 
                                    display={'flex'} 
                                    href={props.activePage.url} 
                                    isExternal>
                                    <span className={"link-text"}>{props.activePage.url}</span>                                  
                                    <span className={"link-icon"}><FaExternalLinkAlt /></span>
                                </Link>
                            </span>
                        </div>
                        <div className={"detail-field"}>
                            <span className={"detail-heading"}>DESCRIPTION:</span>
                            <span className={"detail-data"}>{props.activePage.description}</span>
                        </div>
                        <div className={"detail-field"}>
                            <span className={"detail-heading"}>CATEGORY:</span>
                            <span className={"detail-data"}>{props.activePage.category}</span>
                        </div>
                    </CardBody>
                </Card>
            </div>
            <div className="summary-tab">
                <Button backgroundColor={"teal.200"} size={'sm'}
                        borderRadius={"4px 4px 0px 0px"} onClick={onOpen}>
                    Summary
                </Button>
                <Drawer isOpen={isOpen} onClose={onClose} placement={"bottom"}>
                    <DrawerOverlay />
                    <DrawerContent className={"summary-root"} width={"50%"} marginLeft={"auto"} color={'white'}>
                        <DrawerHeader>{"Summary"}</DrawerHeader>
                        <DrawerBody>
                            
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    )
}

export default Info;