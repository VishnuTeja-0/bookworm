import { Button, ButtonGroup, Accordion, AccordionItem, AccordionButton, Box, AccordionPanel, Card } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import './ListArea.scss';
import { IPageData } from "../../models/IPageData";
import { IListData } from "../../models/IListData";

let testPageData: IPageData[] = [
    {id: 2,name: "Job Finder", url: "https://www.linkedin.com/", 
    description: "Please I need to feed my kids. I am tired of eating the roots of my neighbour's flowerpots",
    category: "Enlightenment"},
    {id: 1, name: "Google", url: "https://www.google.com/", description: "Search stuff", category: "Entertainment"},
    {id: 3,name: "YouTube", url: "https://www.youtube.com/", description: "Watch stuff", category: "Entertainment"},
];

function ListArea(){
    return(
        <div className="listarea-root">
            <ButtonGroup>
                <Button colorScheme='green' variant='solid' leftIcon={<FaPlus />}>Add Page</Button>
            </ButtonGroup>

            <Accordion allowMultiple textColor={'white'} mt={4}>
                {
                    listViewData.map(listItem =>(
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