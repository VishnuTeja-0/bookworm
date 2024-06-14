// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crud::{create_database, get_entries, create_entry, Page};

mod crud;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn init_app<'a>(_app: &'a mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let init_database_result = create_database();
    match init_database_result{
        Ok(_) => {
            let mut test_page = Page{
                id: 0,
                name: String::from("testSite"),
                link: String::from("https://doc.rust-lang.org/book/ch09-00-error-handling.html"),
                description: String::from("This is a test site"),
                category: String::from("Dev Test Sites")
            };
            let create_result = create_entry(test_page);
            match create_result{
                Ok(_) => {
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
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
