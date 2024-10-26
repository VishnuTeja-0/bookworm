import { useEffect, useState } from "react";
import { IPageData } from "../../models/IPageData";

function Info(props: {activePage: IPageData}){
    const [isPageActive, setIsPageActive] = useState<boolean>(false);

    useEffect(() => {
        let isPageActive: boolean = JSON.stringify(props.activePage) !== "{}";
        setIsPageActive(isPageActive);
    }, [props.activePage])

    return(
        <div className={'info-root'}>
            <iframe 
                src={isPageActive ? props.activePage.url : "https://google.com"}
                width = "100%"
                height = "500px" />
        </div>
    )
}

export default Info;