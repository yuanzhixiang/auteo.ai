use gpui::{
    App, AppContext, Application, Context, IntoElement, Render, Window, WindowOptions, div,
    prelude::*, rgb,
};

struct HelloWorld;

impl Render for HelloWorld {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        div()
            .size_full()
            .flex()
            .items_center()
            .justify_center()
            .bg(rgb(0x0f172a))
            .text_color(rgb(0xf8fafc))
            .child(
                div()
                    .flex()
                    .flex_col()
                    .items_center()
                    .gap_3()
                    .child(div().text_3xl().child("Hello, GPUI!"))
                    .child(
                        div()
                            .text_sm()
                            .text_color(rgb(0x94a3b8))
                            .child("A native Rust window rendered on the GPU."),
                    ),
            )
    }
}

fn main() {
    Application::new().run(|cx: &mut App| {
        cx.open_window(WindowOptions::default(), |_window, cx| {
            cx.new(|_| HelloWorld)
        })
        .expect("failed to open the GPUI window");

        cx.activate(true);
    });
}
