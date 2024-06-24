// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crud::{create_database, get_entries, create_entry, Page};
use serde::Serialize;
use Messages::{GetError, CreateError, CreateSuccess};

mod crud;

#[derive(Debug, Serialize)]
#[serde(rename_all="camelCase")]
struct ListItem{
    category: String,
    page_list: Vec<Page>
}

enum Messages{
    GetError,
    CreateError,
    CreateSuccess
}

impl Messages{
    fn message(&self) -> &str{
        match self{
            Messages::GetError => "There was an error in fetching your pages",
            Messages::CreateError => "There was an error in creating a new page",
            Messages::CreateSuccess => "Page was successfully created"
        }
    }
}

fn handle_error(message: &str, err: &dyn std::error::Error) -> String {
    println!("{}", err);
    String::from(message)
}

#[tauri::command]
fn get_pages() -> String {
    let get_result = get_entries();
    match get_result{
        Ok(pages) => {
            match serde_json::to_string(&pages){
                Ok(json) => json,
                Err(err) => handle_error(GetError.message(), &err)
            }
        },
        Err(err) => handle_error(GetError.message(), &err)
    }
}

#[tauri::command]
fn get_pages_listview() -> String {
    let get_result = get_entries();
    match get_result{
        Ok(pages) => {
            let mut pages_listview: Vec<ListItem> = Vec::new();
            let mut current_category: Option<String>;
            let mut current_category_pages: Vec<Page> = Vec::new();
            let length = pages.len();
            if(length > 0){
                current_category = Some(pages[0].category.clone());
                for (index, page) in pages.iter().enumerate() {
                    if index == 0 {
                        current_category_pages.push(page.clone());                     
                    }
                    else {
                        if current_category.clone().unwrap() == page.category {
                            current_category_pages.push(page.clone());
                        }
                        else {
                            pages_listview.push(
                                ListItem{
                                    category: current_category.unwrap(),
                                    page_list: current_category_pages
                                }
                            );

                            current_category = Some(String::from(&page.category));
                            current_category_pages = Vec::new();
                        }
                    }

                    if index == length - 1{
                        pages_listview.push(
                            ListItem{
                                category: current_category.unwrap(),
                                page_list: current_category_pages
                            }
                        );
                        current_category = Some(String::from(&page.category));
                        current_category_pages = Vec::new();
                    } 
                }
            }

            match serde_json::to_string(&pages_listview){
                Ok(json) => json,
                Err(err) => handle_error(GetError.message(), &err)
            }
        },
        Err(err) => {println!("NOkay"); handle_error(GetError.message(), &err)}
    }
}

#[tauri::command]
fn create_page(page_string: &str) -> String{
    match serde_json::from_str::<Page>(page_string){
        Ok(new_page) => {
            let create_result = create_entry(new_page);
            match create_result {
                Ok(_) => String::from(CreateSuccess.message()),
                Err(err) => handle_error(CreateError.message(), &err)
            }
        },
        Err(err) => handle_error(CreateError.message(), &err)
    }
}

fn init_app<'a>(_app: &'a mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let init_database_result = create_database();
    match init_database_result{
        Ok(_) => {
            // let test_page = Page{
            //     id: 0,
            //     name: String::from("testSite"),
            //     url: String::from("https://doc.rust-lang.org/book/ch09-00-error-handling.html"),
            //     description: String::from("This is a test site"),
            //     category: String::from("Dev Test Sites")
            // };
            // let create_result = create_entry(test_page);
            // match create_result{
            //     Ok(_) => {
            //         let get_result = get_entries();
            //         match get_result{
            //             Ok(_) => {

            //             }
            //             Err(err) => {
            //                 println!("{}", err);
            //                 drop(err);
            //             }
            //         }
            //     }
            //     Err(err) => {
            //         println!("{}", err);
            //     }
            // }

            let get_result = get_entries();
            match get_result{
                Ok(_) => {

                }
                Err(err) => {
                    println!("{}", err);
                    drop(err);
                }
            }
        }
        Err(err) => {
            println!("{}", err);
        }
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .setup(init_app)
        .invoke_handler(tauri::generate_handler![get_pages, create_page, get_pages_listview])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
