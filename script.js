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

let target_plot = this_url.searchParams.get('targetPlot');

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

if (target_plot == null) {
    target_plot = "thdPlusN";
}

d3.json(origin+"/data/"+dataset+".json", function(data) {

    function parse_json(distortion_to_plot = "thdPlusN", offset = 0) {
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
                    this_level.push(parseFloat(thd[distortion_to_plot])+offset);
                }else{
                    // this_level.push(-140.0);
                    this_level.push(null);
                }
            }
            pdist.push(this_level);
        }

        return [pfreq, plevel, pdist];
    }


    function format_layout(title) {
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
                        text: "Distortion (dB)"
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

        return layout;
    }

    function format_plot_data(frequency, level, distortion, name="THD+n", color="Rainbow", show_scale=true) {
        let plotdata = {
            x: level,
            y: frequency,
            z: distortion,
            name: name,
            type: 'surface',
            colorscale: color,
            showscale: show_scale
        };
    

        return plotdata;
    }

    let pfreq, plevel, pdist, dist_to_plot;

    if (target_plot == "thdPlusN") {
        [pfreq, plevel, pdist] = parse_json("thdPlusN");
        plotdata = format_plot_data(pfreq, plevel, pdist);
        layout = format_layout("THD+N");
        Plotly.newPlot('thdplusn', [plotdata], layout);
    }

    if (target_plot == "thd") {
        [pfreq, plevel, pdist] = parse_json("thd");
        plotdata = format_plot_data(pfreq, plevel, pdist);
        layout = format_layout("THD");
        Plotly.newPlot('thdplusn', [plotdata], layout);
    }

    if (target_plot == "multi") {
        [pfreq, plevel, pdist] = parse_json("thdPlusN");
        plotdata = format_plot_data(pfreq, plevel, pdist);
        [pfreq2, plevel2, pdist2] = parse_json("thd")
        plotdata2 = format_plot_data(pfreq2, plevel2, pdist2, "THD", "Picnic", false);
        
        layout = format_layout("THD");
        Plotly.newPlot('thdplusn', [plotdata, plotdata2], layout);
    }

    dist_to_plot = "H2";
    [pfreq, plevel, pdist] = parse_json(dist_to_plot);
    plotdata = format_plot_data(pfreq, plevel, pdist);
    layout = format_layout(dist_to_plot)
    Plotly.newPlot('H2', [plotdata], layout);

    dist_to_plot = "H3";
    [pfreq, plevel, pdist] = parse_json(dist_to_plot);
    plotdata = format_plot_data(pfreq, plevel, pdist);
    layout = format_layout(dist_to_plot)
    Plotly.newPlot('H3', [plotdata], layout);

});