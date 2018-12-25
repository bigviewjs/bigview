import React from 'react';
import Layout from "./Layout";
import Header from "./Header";

export default class Html extends React.Component {
    constructor() {
        super();
        this.state = {
            title: 'Welcome to React SSR!',
        };
    }

    render() {
        return (
            <html>
                <head>
                    <meta charset='utf-8'></meta>
                    <title>React SSR</title>
                </head>

                <body>
                    <div id='app'>
                        <Layout></Layout>
                        <hr/>
                        <Header></Header>
                    </div>
                    <script src='./app.bundle.js'></script>
                </body>
            </html>
        );
    }
}
