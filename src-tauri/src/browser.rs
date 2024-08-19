use std::process::Command;
use std::env;
use regex::Regex;

enum Browsers {
    Chrome,
    Edge,
    Firefox,
    Safari,
    Unsupported
}

impl Browsers {
    fn browser_app_names(browser: &str) -> Browsers{
        match browser.to_lowercase().as_str() {
            "google-chrome" | "chrome" | "chrome.exe" | "google chrome" | "google chrome.app" | "com.google.chrome" | "google-chrome.desktop" => Browsers::Chrome,
            "microsoft-edge" | "edge" | "msedge.exe" | "microsoft edge" | "microsoft edge.app" | "com.microsoft.edge" | "microsoft-edge.desktop" => Browsers::Edge,
            "firefox" | "firefox.exe" | "mozilla firefox" | "firefox.app" | "org.mozilla.firefox" | "firefox.desktop" => Browsers::Firefox,
            "safari" | "safari.app" | "com.apple.safari" => Browsers::Safari,
            _ => Browsers::Unsupported
        }
    }
}

#[cfg(target_os = "windows")]
fn get_default_browser_windows() -> Option<String> {
    let output = Command::new("reg")
        .args(&[
            "query",
            r"HKEY_CURRENT_USER\Software\Microsoft\Windows\Shell\Associations\UrlAssociations\http\UserChoice",
            "/v",
            "ProgId",
        ])
        .output()
        .ok()?;

    let output_str = String::from_utf8_lossy(&output.stdout);
    let re = Regex::new(r"ProgId\s+REG_SZ\s+(\S+)").unwrap();
    re.captures(&output_str).and_then(|caps| caps.get(1).map(|m| m.as_str().to_owned()))
}

#[cfg(target_os = "macos")]
fn get_default_browser_macos() -> Option<String> {
    let output = Command::new("defaults")
        .args(&["read", "com.apple.LaunchServices/com.apple.launchservices.secure", "LSHandlers"])
        .output()
        .ok()?;

    let output_str = String::from_utf8_lossy(&output.stdout);
    let re = Regex::new(r#""LSHandlerURLScheme" = "http";\s*"LSHandlerRoleAll" = "([^"]+)";"#).unwrap();
    re.captures(&output_str).and_then(|caps| caps.get(1).map(|m| m.as_str().to_string()))
}

#[cfg(target_os = "linux")]
fn get_default_browser_linux() -> Option<String> {
    env::var("BROWSER").ok().or_else(|| {
        let output = Command::new("xdg-settings")
            .arg("get")
            .arg("default-web-browser")
            .output()
            .ok()?;

        let output_str = String::from_utf8_lossy(&output.stdout);
        let browser = output_str.trim().to_owned();
        if browser.is_empty() {
            None
        } else {
            Some(browser)
        }
    })
}

pub fn get_default_browser() -> Option<String> {
    #[cfg(target_os = "windows")]
    {
        get_default_browser_windows()
    }

    #[cfg(target_os = "macos")]
    {
        get_default_browser_macos()
    }

    #[cfg(target_os = "linux")]
    {
        get_default_browser_linux()
    }
}

pub fn map_browser_command(browser: &str, window_title: &str) -> (String, Vec<String>){
    println!("{browser}");
    match Browsers::browser_app_names(browser) {
        Browsers::Chrome => (
            String::from("google-chrome"), 
            vec![format!("--new-window --window-title={}", window_title)]
        ),
        Browsers::Firefox => (
            String::from("firefox"), 
            vec![format!("-new-window --name={}", window_title)]
        ),
        Browsers::Edge => (
            String::from("msedge"), 
            vec![format!("--new-window --window-title={}", window_title)]
        ),
        Browsers::Safari => (
            String::from("open"), 
            vec![String::from("-na"), String::from("Safari"), String::from("--new"), format!("--args --window-name={}", window_title)]
        ),
        // "brave" => ("brave", vec!["--new-window"]),
        // "Opera" | "OperaStable" => ("opera", vec!["--new-window"]),
        // "Vivaldi" => ("vivaldi", vec!["--new-window"]),
        // "Chromium" => ("chromium", vec!["--new-window"]),
        Browsers::Unsupported => (String::new(), Vec::new()),
    }
}