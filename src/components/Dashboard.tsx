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