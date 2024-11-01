// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

use browser::{get_default_browser, map_browser_command};
use crud::{
    create_database, create_entry, delete_entry, edit_entry, get_category_urls, get_entries,
    get_entry, Page,
};
use rusqlite::ffi::Error;
use serde::Serialize;
use tauri::{LogicalPosition, LogicalSize, Manager, PhysicalPosition, PhysicalSize, Webview, Window};
use Messages::*;

mod browser;
mod crud;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ListItem {
    category: String,
    page_list: Vec<Page>,
}

enum Messages {
    GetError,
    CreateError,
    CreateSuccess,
    EditError,
    EditSuccess,
    DeleteError,
    DeleteSuccess,
    OpenBrowserError,
    DefaultBrowserError,
    DefaultSuccess,
}

impl Messages {
    fn message(&self) -> &str {
        match self {
            Messages::GetError => "There was an error in fetching your pages",
            Messages::CreateError => "There was an error in creating a new page",
            Messages::CreateSuccess => "Page was successfully created",
            Messages::EditError => "There was an error in editing page",
            Messages::EditSuccess => "Page was successfully edited",
            Messages::DeleteError => "There was an error in deleting page",
            Messages::DeleteSuccess => "Page was successfully deleted",
            Messages::OpenBrowserError => "There was an error in opening your pages",
            Messages::DefaultBrowserError => "Default browser not recognized or supported",
            Messages::DefaultSuccess => "Success",
        }
    }
}

fn handle_error(message: &str, err: &dyn std::error::Error) -> String {
    eprintln!("{err}");
    message.to_owned()
}

#[tauri::command]
fn get_pages_listview() -> (bool, String) {
    let get_result = get_entries();
    match get_result {
        Ok(pages) => {
            let mut pages_listview: Vec<ListItem> = Vec::new();
            let mut current_category: Option<String>;
            let mut current_category_pages: Vec<Page> = Vec::new();
            let length = pages.len();
            if length > 0 {
                current_category = Some(pages[0].category.clone());
                for (index, page) in pages.iter().enumerate() {
                    if index == 0 {
                        current_category_pages.push(page.clone());
                    } else {
                        if current_category.clone().unwrap() == page.category {
                            current_category_pages.push(page.clone());
                        } else {
                            pages_listview.push(ListItem {
                                category: current_category.unwrap(),
                                page_list: current_category_pages,
                            });

                            current_category = Some(String::from(&page.category));
                            current_category_pages = vec![page.clone()];
                        }
                    }

                    if index == length - 1 {
                        pages_listview.push(ListItem {
                            category: current_category.unwrap(),
                            page_list: current_category_pages,
                        });
                        current_category = Some(String::from(&page.category));
                        current_category_pages = Vec::new();
                    }
                }
            }

            match serde_json::to_string(&pages_listview) {
                Ok(json) => (true, json),
                Err(err) => (false, handle_error(GetError.message(), &err)),
            }
        }
        Err(err) => (false, handle_error(GetError.message(), &err)),
    }
}

#[tauri::command]
fn get_page(id: u32) -> (bool, String) {
    let get_result = get_entry(id);
    match get_result {
        Ok(page) => match serde_json::to_string(&page) {
            Ok(json) => (true, json),
            Err(err) => (false, handle_error(GetError.message(), &err)),
        },
        Err(err) => (false, handle_error(GetError.message(), &err)),
    }
}

#[tauri::command]
fn create_page(page_string: &str) -> (bool, String) {
    match serde_json::from_str::<Page>(page_string) {
        Ok(new_page) => {
            let create_result = create_entry(new_page);
            match create_result {
                Ok(_) => (true, CreateSuccess.message().to_owned()),
                Err(err) => (false, handle_error(CreateError.message(), &err)),
            }
        }
        Err(err) => (false, handle_error(CreateError.message(), &err)),
    }
}

#[tauri::command]
fn edit_page(id: u32, page_string: &str) -> (bool, String) {
    match serde_json::from_str::<Page>(page_string) {
        Ok(new_page) => {
            let edit_result = edit_entry(id, new_page);
            match edit_result {
                Ok(_) => (true, EditSuccess.message().to_owned()),
                Err(err) => (false, handle_error(EditError.message(), &err)),
            }
        }
        Err(err) => (false, handle_error(EditError.message(), &err)),
    }
}

#[tauri::command]
fn delete_page(id: u32) -> (bool, String) {
    let delete_result = delete_entry(id);
    match delete_result {
        Ok(_) => (true, DeleteSuccess.message().to_owned()),
        Err(err) => (false, handle_error(DeleteError.message(), &err)),
    }
}

#[tauri::command]
fn open_browser_window(link_string: &str, is_url: bool) -> (bool, String) {
    if is_url {
        match webbrowser::open(link_string) {
            Ok(_) => (true, DefaultSuccess.message().to_owned()),
            Err(err) => (false, handle_error(OpenBrowserError.message(), &err)),
        }
    } else {
        let default_browser = match get_default_browser() {
            Some(browser) => browser,
            None => return (false, DefaultBrowserError.message().to_owned()),
        };

        let (browser_command, mut args) = map_browser_command(&default_browser, &link_string);

        if browser_command.is_empty() {
            // No error object
            return (false, DefaultBrowserError.message().to_owned());
        }

        let get_result = get_category_urls(link_string);
        match get_result {
            Ok(urls) => {
                args.extend_from_slice(&urls);

                match Command::new(browser_command).args(&args).status() {
                    Ok(status) => {
                        if status.success() {
                            (true, DefaultSuccess.message().to_owned())
                        } else {
                            // No error object
                            (false, OpenBrowserError.message().to_owned())
                        }
                    }
                    Err(err) => (false, handle_error(DefaultBrowserError.message(), &err)),
                }
            }
            Err(err) => (false, handle_error(OpenBrowserError.message(), &err)),
        }
    }
}

// fn setup_window<'a>(_app: &'a mut tauri::App) -> Result<()>{
    

//     Ok(())
// }

// fn set_preview_url(link_string: &str) -> (bool, String) {
    
// }

fn init_app<'a>(_app: &'a mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let init_database_result = create_database();
    match init_database_result {
        Ok(_) => {
            // let test_page = Page{
            //     id: 0,
            //     name: String::from("Literally Google"),
            //     url: String::from("https://www.google.com"),
            //     description: String::from("This is a test site"),
            //     category: String::from("Dev Test Sites 2")
            // };
            // let create_result = create_entry(test_page);
            // match create_result{
            //     Ok(_) => {
            //         // let get_result = get_entries();
            //         // match get_result{
            //         //     Ok(_) => {

            //         //     }
            //         //     Err(err) => {
            //         //         println!("{}", err);
            //         //         drop(err);
            //         //     }
            //         // }
            //     }
            //     Err(err) => {
            //         println!("{}", err);
            //     }
            // }

            let get_result = get_entries();
            match get_result {
                Ok(_) => {}
                Err(err) => {
                    println!("{}", err);
                    drop(err);
                }
            }
        }
        Err(err) => {
            println!("{}", err);
            drop(err);
        }
    }

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let _window: Window = app.get_window("main").expect("Error while running app");

            let size = _window.inner_size().unwrap();
            let width = f64::from(size.width);
            let height = f64::from(size.height);

            _window.add_child(
                tauri::webview::WebviewBuilder::new(
                    "preview",
                    tauri::WebviewUrl::External("https://google.com".parse().unwrap())
                ).auto_resize(),
                LogicalPosition::new(width * 0.55, 100.0),
                LogicalSize::new( width * 0.4, height * 0.4),
            )?;

            let _ = _window.set_size(PhysicalSize{width: width + 1.0, height: height});

            init_app(app)
        })
        .invoke_handler(tauri::generate_handler![
            get_page,
            create_page,
            edit_page,
            delete_page,
            get_pages_listview,
            open_browser_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running app");
}
