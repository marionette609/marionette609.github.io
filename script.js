let this_url = window.location.href;
this_url = new URL(this_url);
let origin = this_url.origin;

if (origin == "null") {
    origin = "https://marionette609.github.io"
}

let dataset = this_url.searchParams.get("dataset");
let zmax = this_url.searchParams.get("zMax");
let zmin = this_url.searchParams.get("zMin");

let xlabel = this_url.searchParams.get("xLabel");

if (dataset == null) {
    dataset = "DC07-balanced-300";
}

if (zmax == null) {
    zmax = -40;
}

if (zmin == null) {
    zmin = -130;
}

if (xlabel == null) {
    xlabel = "dBu";
}

d3.json(origin+"/data/"+dataset+".json", function(data) {

    function parse_json(distortion_to_plot = "thdPlusN") {
        let pfreq = [];
        let plevel = []
        let pdist = [];
    
        data_keys = Object.keys(data);
        data_keys.sort((x,y) => {
            floatx = parseFloat(x);
            floaty = parseFloat(y);
            return x-y;
        });
    
        // iterating data[data_keys]
        for(let i = 0; i < data_keys.length; i++) {
            float_freq = parseFloat(data_keys[i]);
            if(float_freq < 20 || float_freq > 10000) {
                continue;
            }
            pfreq.push(float_freq);
            pfreq.sort((x,y) => x - y);
            let this_level = [];
    
            level_keys = Object.keys(data[data_keys[i]]);
            level_keys.sort((x,y) => {
                floatx = parseFloat(x);
                floaty = parseFloat(y);
                return x-y;
            });
            for(let j = 0; j < level_keys.length; j++) {
                // iterating data[data_keys[i]][level_keys[j]]
                let thd = data[data_keys[i]][level_keys[j]];
                float_level = parseFloat(level_keys[j]);
                if(!plevel.includes(float_level)){
                    plevel.push(float_level);
                    plevel.sort((x,y) => x - y);
                }
                if(thd.hasOwnProperty(distortion_to_plot)){
                    this_level.push(parseFloat(thd[distortion_to_plot]));
                }else{
                    // this_level.push(-140.0);
                    this_level.push(null);
                }
            }
            pdist.push(this_level);
        }

        return [pfreq, plevel, pdist];
    }

    function format_plot_data(frequency, level, distortion, title) {
        let plotdata = [{
            x: level,
            y: frequency,
            z: distortion,
            type: 'surface',
            colorscale: "Rainbow",
            contours: {
                z: {
                    show:true,
                    usecolormap: true,
                    highlightcolor:"#42f462",
                    project:{z: true}
                }
            }
        }];
    
        let layout = {
            title: {
                text: "Distortion Surface " + title + " " + dataset
            },
            scene: {
                yaxis: {
                    type: "log",
                    dtick: 1,
                    autorange: true,
                    title: {
                        text: "Frequency (y)"
                    }
                },
                xaxis: {
                    title: {
                        text: xlabel + " (x)"
                    }
                },
                zaxis: {
                    range: [zmin, zmax],
                    title: {
                        text: "THD+N (z)"
                    }
                },
                aspectratio: {
                    "x": 1,
                    "y": 1,
                    "z": 1
                }
            },
    
            autosize: false,
            width: 1000,
            height: 1000
    
        };
        return [plotdata, layout];
    }

    let pfreq, plevel, pdist, dist_to_plot;

    dist_to_plot = "thdPlusN";
    [pfreq, plevel, pdist] = parse_json(dist_to_plot);
    [plotdata, layout] = format_plot_data(pfreq, plevel, pdist, dist_to_plot);
    Plotly.newPlot('thdplusn', plotdata, layout);

    dist_to_plot = "H2";
    [pfreq, plevel, pdist] = parse_json(dist_to_plot);
    [plotdata, layout] = format_plot_data(pfreq, plevel, pdist, dist_to_plot);
    Plotly.newPlot('H2', plotdata, layout);

    dist_to_plot = "H3";
    [pfreq, plevel, pdist] = parse_json(dist_to_plot);
    [plotdata, layout] = format_plot_data(pfreq, plevel, pdist, dist_to_plot);
    Plotly.newPlot('H3', plotdata, layout);

});