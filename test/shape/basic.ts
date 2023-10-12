

const list = [
    {
        label: '矩形',
        className: 'RectNode',
        attributes: {
            width: 100,
            height: 50,
            fill:''
        },
        path: '<svg viewBox="-5 -5 115 115" width="32" height="32"><rect x="4" y="20" width="92" height="60" rx="10" ry="10" fill="#ffffff" stroke="#000000" stroke-width="4"></rect></svg>'
    },
    {
        label: '椭圆',
        className: 'EllipseNode',
        attributes: {
            radiusX: 50,
            radiusY: 25
        },
        path: '<svg viewBox="-5 -5 115 115" width="32" height="32"><ellipse cx="50" cy="50" rx="46" ry="30" fill="#ffffff" stroke="#000000" stroke-width="4"></ellipse></svg>'
    },
    {
        label: '正多边形',
        className: 'RegularPolygonNode',
        attributes: {
            sides: 6,
            radius: 40,
        },
        path: '<svg viewBox="-230 -230 480 480" width="32" height="32"><polygon points="0,200 173.20508,100 173.20508,-100 0,-200 -173.20508,-100 -173.20508,100" fill="#ffffff" stroke="#000000" stroke-width="20"></polygon></svg>'
    },
    {
        label: '星形',
        className: 'StarNode',
        attributes: {
            numPoints: 6,
            innerRadius: 20,
            outerRadius: 40,
        },
        path: '<svg viewBox="-230 -230 480 480" width="32" height="32"><polygon points="0,200 50,86.60254 173.20508,100 100,0 173.20508,-100 50,-86.60254 0,-200 -50,-86.60254 -173.20508,-100 -100,0 -173.20508,100 -50,86.60254" fill="#ffffff" stroke="#000000" stroke-width="20"></polygon></svg>'
    },
    {
        label: '圆形',
        className: 'CircleNode',
        attributes: {
            radius: 50
        },
        path: '<svg viewBox="-53 -53 113 113" width="32" height="32"><circle cx="0" cy="0" r="40" fill="#ffffff" stroke="#000000" stroke-width="4"></circle></svg>'
    },
    {
        label: '环形',
        className: 'RingNode',
        attributes: {
            innerRadius: 20,
            outerRadius: 40
        },
        path: '<svg viewBox="-53 -53 113 113" width="32" height="32"><circle cx="0" cy="0" r="40" fill="#ffffff" stroke="#000000" stroke-width="4"></circle><circle cx="0" cy="0" r="30" fill="#ffffff" stroke="#000000" stroke-width="4"></circle></svg>'
    },
    {
        label: '扇形',
        className: 'WedgeNode',
        attributes: {
            angle: 90,
            radius: 50,
            clockwise: true
        },
        path: '<svg viewBox="-35 -60 70 70" width="32" height="32"><path d="M0 -0 L-25 -43.3 A50 50 0 0 1 25 -43.3Z" fill="#ffffff" stroke="#000000" stroke-width="3"></path></svg>'
    },
    {
        label: '弧形',
        className: 'ArcNode',
        attributes: {
            angle: 30,
            innerRadius: 50,
            outerRadius: 100,
            clockwise: false
        },
        path: '<svg viewBox="-35 -75 70 70" width="32" height="32"><path d="M-25 -43.3 A50 50 0 0 1 25 -43.3" fill="#ffffff" stroke="#000000" stroke-width="3"></path></svg>'
    },
    {
        label: '心形',
        className: 'PathNode',
        attributes: {
            data: 'M213.1,6.7c-32.4-14.4-73.7,0-88.1,30.6C110.6,4.9,67.5-9.5,36.9,6.7C2.8,22.9-13.4,62.4,13.5,110.9C33.3,145.1,67.5,170.3,125,217c59.3-46.7,93.5-71.9,111.5-106.1C263.4,64.2,247.2,22.9,213.1,6.7z'
        },
        path: '<svg viewBox="-15 -27 300 300" width="32" height="32"><path d="M213.1,6.7c-32.4-14.4-73.7,0-88.1,30.6C110.6,4.9,67.5-9.5,36.9,6.7C2.8,22.9-13.4,62.4,13.5,110.9C33.3,145.1,67.5,170.3,125,217c59.3-46.7,93.5-71.9,111.5-106.1C263.4,64.2,247.2,22.9,213.1,6.7z" fill="#ffffff" stroke="#000000" stroke-width="12" /></svg>'
    },
    {
        label:'风扇',
        className:'PathNode',
        attributes:{
            scaleX:0.1,
            scaleY:0.1,
            data:'M696.8 504.5c0-11.7-1.4-23-3.4-34.1 2 11 3.4 22.4 3.4 34.1h260.8c0-135.6-60.6-256.8-155.8-338.8L632.4 364.6c-32.7-28.6-75-46.4-121.9-46.4-11.5 0-22.7 1.4-33.6 3.4 10.9-2 22.1-3.4 33.6-3.4V57.3c-137.1 0-259.6 61.8-341.6 158.9L368 385.8c-26.9 32.3-43.8 73.3-43.8 118.7 0 11.5 1.4 22.7 3.4 33.6-2-10.9-3.4-22.1-3.4-33.6H63.3c0 137.1 61.8 259.6 158.9 341.6L391.8 647c32.3 26.9 73.3 43.8 118.7 43.8 11.7 0 23-1.4 34.1-3.4-11.1 2.1-22.4 3.4-34.1 3.4v260.8c135.6 0 256.8-60.6 338.8-155.8l-199-169.4c28.6-32.8 46.5-75.1 46.5-121.9zM684 437.9c3.5 8.8 6.4 17.9 8.5 27.3-2.1-9.4-5.1-18.5-8.5-27.3z m-26-46.1c0.4 0.5 0.7 0.9 1.1 1.3-0.4-0.4-0.8-0.8-1.1-1.3z m10.9 15.7c4 6.4 7.7 13.1 10.9 20.1-3.2-7-7-13.6-10.9-20.1z m-198.1-84.9c-9.3 2-18.3 5-27 8.4 8.7-3.4 17.7-6.3 27-8.4z m-38.2 13.1c-6.9 3.2-13.5 6.8-19.9 10.8 6.4-4 13.1-7.6 19.9-10.8z m-35.2 21.7c-0.9 0.7-1.7 1.5-2.6 2.2 0.8-0.8 1.7-1.5 2.6-2.2zM337 571.2c-3.4-8.7-6.3-17.7-8.4-27 2 9.3 5 18.2 8.4 27z m28.5 49c-0.7-0.9-1.5-1.7-2.2-2.6 0.8 0.9 1.5 1.7 2.2 2.6z m-13-18z m46.2-97.7c0-61.6 50.1-111.8 111.8-111.8s111.8 50.1 111.8 111.8c0 61.6-50.1 111.8-111.8 111.8s-111.8-50.2-111.8-111.8zM623.1 652c-0.5 0.4-0.9 0.7-1.3 1.1 0.4-0.4 0.8-0.8 1.3-1.1z m-15.7 10.9c-6.4 4-13.1 7.7-20.1 10.9 7-3.2 13.7-7 20.1-10.9zM577 678c-8.8 3.5-17.9 6.4-27.3 8.5 9.5-2.1 18.5-5.1 27.3-8.5z'
        },
        path:'<svg t="1679896772233" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5554" width="32" height="32"> <path d="M696.8 504.5c0-11.7-1.4-23-3.4-34.1 2 11 3.4 22.4 3.4 34.1h260.8c0-135.6-60.6-256.8-155.8-338.8L632.4 364.6c-32.7-28.6-75-46.4-121.9-46.4-11.5 0-22.7 1.4-33.6 3.4 10.9-2 22.1-3.4 33.6-3.4V57.3c-137.1 0-259.6 61.8-341.6 158.9L368 385.8c-26.9 32.3-43.8 73.3-43.8 118.7 0 11.5 1.4 22.7 3.4 33.6-2-10.9-3.4-22.1-3.4-33.6H63.3c0 137.1 61.8 259.6 158.9 341.6L391.8 647c32.3 26.9 73.3 43.8 118.7 43.8 11.7 0 23-1.4 34.1-3.4-11.1 2.1-22.4 3.4-34.1 3.4v260.8c135.6 0 256.8-60.6 338.8-155.8l-199-169.4c28.6-32.8 46.5-75.1 46.5-121.9zM684 437.9c3.5 8.8 6.4 17.9 8.5 27.3-2.1-9.4-5.1-18.5-8.5-27.3z m-26-46.1c0.4 0.5 0.7 0.9 1.1 1.3-0.4-0.4-0.8-0.8-1.1-1.3z m10.9 15.7c4 6.4 7.7 13.1 10.9 20.1-3.2-7-7-13.6-10.9-20.1z m-198.1-84.9c-9.3 2-18.3 5-27 8.4 8.7-3.4 17.7-6.3 27-8.4z m-38.2 13.1c-6.9 3.2-13.5 6.8-19.9 10.8 6.4-4 13.1-7.6 19.9-10.8z m-35.2 21.7c-0.9 0.7-1.7 1.5-2.6 2.2 0.8-0.8 1.7-1.5 2.6-2.2zM337 571.2c-3.4-8.7-6.3-17.7-8.4-27 2 9.3 5 18.2 8.4 27z m28.5 49c-0.7-0.9-1.5-1.7-2.2-2.6 0.8 0.9 1.5 1.7 2.2 2.6z m-13-18z m46.2-97.7c0-61.6 50.1-111.8 111.8-111.8s111.8 50.1 111.8 111.8c0 61.6-50.1 111.8-111.8 111.8s-111.8-50.2-111.8-111.8zM623.1 652c-0.5 0.4-0.9 0.7-1.3 1.1 0.4-0.4 0.8-0.8 1.3-1.1z m-15.7 10.9c-6.4 4-13.1 7.7-20.1 10.9 7-3.2 13.7-7 20.1-10.9zM577 678c-8.8 3.5-17.9 6.4-27.3 8.5 9.5-2.1 18.5-5.1 27.3-8.5z" fill="#20A4FF" p-id="5555"></path></svg>'


    },
    {
        label: '文字',
        className: 'TextNode',
        attributes: {
            text: '文本信息',
            fontSize: 14,
            fontFamily: 'Calibri',
            padding:5,
            fill:'#ff0000',
            strokeWidth:0
        },
        path: '<svg viewBox="0 0 100 100" width="32" height="32"><path d="M20 20 L80 20 M50 20 L50 80" fill="#000000" stroke="#000000" stroke-width="8"></path></svg>'
    },
    {
        label: '标签',
        className: 'LabelNode',
        attributes: {
            text: 'Tooltip',
            fontSize: 30,
            fontFamily: 'Calibri',
            textFill:'#ffffff',
            fill: 'black',
            pointerWidth: 10,
            pointerHeight: 10,
            lineJoin: 'round',
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffsetX: 10,
            shadowOffsetY: 10,
            shadowOpacity: 0.5,
            padding:10,
            pointerDirection:'down'
        },
       
        path: '<svg t="1677742278587" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2100" width="32" height="32"><path d="M170.666667 85.333333h682.666666a85.333333 85.333333 0 0 1 85.333334 85.333334v512a85.333333 85.333333 0 0 1-85.333334 85.333333h-170.666666l-170.666667 170.666667-170.666667-170.666667H170.666667a85.333333 85.333333 0 0 1-85.333334-85.333333V170.666667a85.333333 85.333333 0 0 1 85.333334-85.333334m0 85.333334v512h206.08L512 817.92 647.253333 682.666667H853.333333V170.666667H170.666667z" fill="" p-id="2101"></path></svg>'
    },
    {
        label: '图片',
        className: 'ImageNode',
        attributes: {
           width:200,
           height:200,
           fill:"",
           stroke:"",
           image:'https://i.postimg.cc/BQDBBTp3/image.jpg'
        },
        url: 'https://i.postimg.cc/BQDBBTp3/image.jpg'
    },
    {
        label: 'Yoda',
        className: 'ImageNode',
        attributes: {
           width:200,
           height:200,
           fill:"",
           stroke:"",
           image:'https://konvajs.org/assets/yoda.gif'
        },
        url: 'https://konvajs.org/assets/yoda.gif'
    }
];



export default list;