use gpui::{
    App, AppContext, Application, Context, IntoElement, Render, TitlebarOptions, Window,
    WindowOptions, div, prelude::*,
};
use gpui_component::{Root, StyledExt, button::*};

struct AuteoApp {
    started: bool,
}

impl Render for AuteoApp {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        div()
            .size_full()
            .v_flex()
            .gap_4()
            .items_center()
            .justify_center()
            .child(div().text_3xl().child("Auteo"))
            .child(if self.started {
                "Auteo is ready for your next cut."
            } else {
                "AI video editing, built for your creative flow."
            })
            .child(
                Button::new("get-started")
                    .primary()
                    .label(if self.started { "Ready" } else { "Get started" })
                    .on_click(cx.listener(|this, _, _, cx| {
                        this.started = true;
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
                    title: Some("Auteo".into()),
                    appears_transparent: true,
                    ..Default::default()
                }),
                ..Default::default()
            },
            |window, cx| {
                let auteo = cx.new(|_| AuteoApp { started: false });
                cx.new(|cx| Root::new(auteo, window, cx))
            },
        )
        .expect("failed to open the Auteo window");

        cx.activate(true);
    });
}
