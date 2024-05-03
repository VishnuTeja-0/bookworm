import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Header from "./Header/Header";
import ListArea from "./ListArea/ListArea";
import "./Dashboard.scss";

function Dashboard() {
    return(
        <div className="dashboard-root">
            <Header />
            <ListArea />
        </ div>
    )
}

export default Dashboard;