d3.json("https://raw.githubusercontent.com/marionette609/rew-scripts/refs/heads/main/sample-data/jot2-ess-dbu.json", function(data) {

    var pfreq = [];
    var plevel = []
    var pthd = [];

    var distortion_to_plot = "thdPlusN"; // Valid values are thdPlusN, H# e.x. H2

    graph_levels = []


    data_keys = Object.keys(data);
    data_keys.sort((x,y) => {
        floatx = parseFloat(x);
        floaty = parseFloat(y);
        return x-y;
    });

    // iterating data[data_keys]
    for(var i = 0; i < data_keys.length; i++) {
        float_freq = parseFloat(data_keys[i]);
        if(float_freq < 20 || float_freq > 10000) {
            continue;
        }
        pfreq.push(float_freq);
        pfreq.sort((x,y) => x - y);
        var this_level = [];

        level_keys = Object.keys(data[data_keys[i]]);
        level_keys.sort((x,y) => {
            floatx = parseFloat(x);
            floaty = parseFloat(y);
            return x-y;
        });
        for(var j = 0; j < level_keys.length; j++) {
            // iterating data[data_keys[i]][level_keys[j]]
            var thd = data[data_keys[i]][level_keys[j]];
            float_level = parseFloat(level_keys[j]);
            if(!plevel.includes(float_level)){
                plevel.push(float_level);
                plevel.sort((x,y) => x - y);
            }
            if(thd.hasOwnProperty(distortion_to_plot)){
                this_level.push(parseFloat(thd[distortion_to_plot]));
            }else{
                this_level.push(-100.0);
            }
        }
        graph_levels.push(this_level);
    }



    var data = [{
        x: plevel,
        y: pfreq,
        z: graph_levels,
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

    var layout = {
        title: {
            text: 'Distortion Surface'
        },
        scene: {
            yaxis: {
                type: 'log',
                dtick: 1,
                autorange: true,
                title: {
                    text: "Frequency (y)"
                }
            },
            xaxis: {
                title: {
                    text: "dBu (x)"
                }
            },
            zaxis: {
                range: [-130, -40],
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

    Plotly.newPlot('myDiv', data, layout);

});