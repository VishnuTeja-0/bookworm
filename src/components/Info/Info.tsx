import { useEffect, useState } from "react";
import { IPageData } from "../../models/IPageData";
import './Info.scss';
import { Card, CardBody, CardHeader, Heading, Link } from "@chakra-ui/react";
import { FaExternalLinkAlt } from "react-icons/fa";

function Info(props: {activePage: IPageData}){
    const [isPageActive, setIsPageActive] = useState<boolean>(false);

    useEffect(() => {
        let isPageActive: boolean = JSON.stringify(props.activePage) !== "{}";
        setIsPageActive(isPageActive);
    }, [props.activePage])

    return(
        <div className={"info-root"}>
            <div className={"preview"}>

            </div>
            <div className={"summary"} hidden={!isPageActive}>
                <Card width={'100%'} backgroundColor={'gray.500'} color={'white'} size='sm' p={2}>
                    <CardHeader py={1}>
                        <Heading size='sm'>Details</Heading>
                    </CardHeader>
                    <CardBody>
                        <div className={"summary-field"}>
                            <span className={"summary-heading"}>NAME:</span>
                            <span className={"summary-detail"}>{props.activePage.name}</span>
                        </div>
                        <div className={"summary-field"}>
                            <span className={"summary-heading"}>LINK:</span>
                            <span className={"summary-detail"}>
                                <Link 
                                    display={'flex'} 
                                    href={props.activePage.url} 
                                    isExternal>
                                    <span className={"link-text"}>{props.activePage.url}</span>                                  
                                    <span className={"link-icon"}><FaExternalLinkAlt /></span>
                                </Link>
                            </span>
                        </div>
                        <div className={"summary-field"}>
                            <span className={"summary-heading"}>DESCRIPTION:</span>
                            <span className={"summary-detail"}>{props.activePage.description}</span>
                        </div>
                        <div className={"summary-field"}>
                            <span className={"summary-heading"}>CATEGORY:</span>
                            <span className={"summary-detail"}>{props.activePage.category}</span>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}

export default Info;