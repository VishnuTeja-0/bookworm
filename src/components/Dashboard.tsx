import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import Header from "./Header/Header";
import ListArea from "./ListArea/ListArea";
import "./Dashboard.scss";
import Info from "./Info/Info";
import { IPageData } from "../models/IPageData";


function Dashboard() {
    const [activePage, setActivePage] = useState<IPageData>({} as IPageData);

    useEffect(() => {
        let defaultPreview = window.location.href + "/src/components/Info/DefaultPreview.html";
        let activeLink = activePage && activePage.url ? activePage.url : defaultPreview;
        invoke<[boolean, string]>('set_preview_url', {linkString: activeLink})
        .then(([isSuccess, result]) => {
            if(isSuccess){
                console.log(result);
            }
            else{
                // error alert
                console.log(result);
                alert(result);
            }
        })
        .catch((err) => {
            //error alert - call fail
            console.log(err);
            alert(err);
        })
    }, [activePage])

    return(
        <div className="dashboard-root">
            <Header />
            <div className="dashboard-body">
                <ListArea setActivePage={setActivePage}/>
                <Info activePage={activePage}/>
            </div>
        </ div>
    )
}

export default Dashboard;