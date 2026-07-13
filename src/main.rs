use gpui::{
    App, AppContext, Application, Context, IntoElement, Render, TitlebarOptions, Window,
    WindowOptions, div, prelude::*,
};
use gpui_component::{Root, StyledExt, button::*};

struct HelloWorld {
    greeted: bool,
}

impl Render for HelloWorld {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        div()
            .size_full()
            .v_flex()
            .gap_4()
            .items_center()
            .justify_center()
            .child(div().text_3xl().child("Hello, GPUI Component!"))
            .child(if self.greeted {
                "The button works. Welcome to native Rust UI."
            } else {
                "This Hello World is rendered with gpui-component."
            })
            .child(
                Button::new("say-hello")
                    .primary()
                    .label(if self.greeted { "Hello!" } else { "Say hello" })
                    .on_click(cx.listener(|this, _, _, cx| {
                        this.greeted = true;
                        cx.notify();
                    })),
            )
    }
}

fn main() {
    Application::new().run(|cx: &mut App| {
        gpui_component::init(cx);

        cx.open_window(
            WindowOptions {
                titlebar: Some(TitlebarOptions {
                    appears_transparent: true,
                    ..Default::default()
                }),
                ..Default::default()
            },
            |window, cx| {
                let hello_world = cx.new(|_| HelloWorld { greeted: false });
                cx.new(|cx| Root::new(hello_world, window, cx))
            },
        )
        .expect("failed to open the GPUI Component window");

        cx.activate(true);
    });
}
