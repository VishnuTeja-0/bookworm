import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Header from "./Header/Header";
import ListArea from "./ListArea/ListArea";
import "./Dashboard.scss";

function Dashboard() {
    return(
        <div className="dashboard-root">
            <Header />
            <div className="dashboard-body">
                <ListArea />
            </div>
        </ div>
    )
}

export default Dashboard;