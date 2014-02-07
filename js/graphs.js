//graphs.js
            function compose() {
                var funcs = arguments;
                return function(x) {
                    for(var i = funcs.length-1; i >= 0; i--) {
                        x = funcs[i](x);
                    }
                    return x;
                }
            }
            function itemgetter(i) { return function(x) { return x[i]; } }
            function as_date(x) { return new Date(1000*x); }
            function not_null(x) { return x != null; }
            var cloneOf = (function() {
              function F(){}
              return function(o) {
                F.prototype = o;
                return new F();
              }
            }());
            
            function get_area_mean(data) {
                var top = 0;
                var bottom = 0;
                for(var i = 0; i < data.length; i++) {
                    if(data[i][1] == null) continue; // no data for bin
                    top += data[i][1] * data[i][2];
                    bottom += data[i][2];
                }
                return {"area": top, "mean": bottom==0?null:top/bottom};
            }
            
            function plot(g, unit, total_unit, lines, stack, proportion_view) {
                // lines is a list of objects which have attributes data, color, and label
                
                var orig_unit = unit;
                var orig_total_unit = total_unit;
                var orig_lines = lines;
                if(proportion_view) {
                    var totals = {};
                    for(var i = 0; i < lines.length; ++i) {
                        var line = lines[i];
                        for(var j = 0; j < line.data.length; ++j) {
                            var time_str = JSON.stringify(line.data[j][0]);
                            if(!totals.hasOwnProperty(time_str)) totals[time_str] = 0;
                            totals[time_str] += line.data[j][1];
                        }
                    }
                    
                    var new_lines = [];
                    for(var i = 0; i < lines.length; ++i) {
                        var line = lines[i];
                        var new_line = cloneOf(line);
                        
                        new_line.data = [];
                        for(var j = 0; j < line.data.length; ++j) {
                            var time_str = JSON.stringify(line.data[j][0]);
                            new_line.data.push([line.data[j][0], totals[time_str] ? line.data[j][1]*100/totals[time_str] : null, line.data[j][2]]);
                        }
                        
                        new_lines.push(new_line)
                    }
                    var lines = new_lines;
                    var unit = '%';
                    var total_unit = null;
                }
                
                var table_div = document.createElement("div");
                g.node().parentNode.insertBefore(table_div, g.node().nextSibling);
                table_div.style.display = "none";
                // table_div.className = "active";
                
                var showhide = document.createElement("p");
                showhide.className = "active";
                g.node().parentNode.insertBefore(showhide, g.node().nextSibling);
                d3.select(showhide).append("button").attr('class',"active").append("a")
                    .text('Show/hide table')
                    .on('click', function() { table_div.style.display = table_div.style.display == "block" ? "none" : "block" })
                    .attr("style", "color:blue;text-decoration:underline;cursor:pointer").attr('class',"active");
                if(stack) {
                    d3.select(showhide).append('span').text(' ');
                    d3.select(showhide).append("button").attr('class',"active").append("a")
                        .text('Switch to/from proportion view')
                        .on('click', function() {
                            table_div.parentNode.removeChild(table_div);
                            showhide.parentNode.removeChild(showhide);
                            plot(g, orig_unit, orig_total_unit, orig_lines, stack, !proportion_view);
                        })
                        .attr("style", "color:blue;text-decoration:underline;cursor:pointer");
                }
                
                for(var i = 0; i < lines.length; ++i) {
                    var line = lines[i];
                    var table_sel = d3.select(table_div).append('table').attr('border', 1).attr('style', 'float:left');
                    
                    var first_tr = table_sel.insert('tr');
                    first_tr.append('th').text('Date');
                    first_tr.append('th').text(line.label + '/(' + unit + ')');
                    
                    var new_data = []
                    for(var j = 0; j < line.data.length; ++j)
                        if(j % 7 == 3)
                            new_data.push(line.data[j]);
                    var tr = table_sel.selectAll().data(new_data).enter().append('tr');
                    tr.append('td').text(function(datum){return new Date(1000*datum[0]).toString()});
                    tr.append('td').text(function(datum){return d3.format(".3s")(datum[1])});
                }
                d3.select(table_div).append('div').attr('style', 'clear:both');
                
                var p_after = d3.select(table_div).append('p');
                p_after.append("a")
                    .text('Show/hide table')
                    .on('click', function() { table_div.style.display = table_div.style.display == "block" ? "none" : "block" })
                    .attr("style", "color:blue;text-decoration:underline;cursor:pointer");
                
                
                var w = 700;
                var h = 300;
                var margin_v = 40;
                var margin_h = 180;
                
                var x = d3.time.scale().domain([
                    as_date(d3.min(lines, function(line) { return d3.min(line.data, itemgetter(0)); })),
                    as_date(d3.max(lines, function(line) { return d3.max(line.data, itemgetter(0)); }))
                ]).range([0 + margin_h, w - margin_h]);
                
                
                g.attr("width", w).attr("height", h);
                g.selectAll("*").remove();
                
                if(stack) {                   
                    var data = d3.layout.stack()
                        .x(itemgetter(0))
                        .y(itemgetter(1))
                        .values(function(line){ return line.data })
                        (lines);
                    
                    var y = d3.scale.linear().domain([
                        0,
                        d3.max(data, function(d) { return d3.max(d.data, function(d) { return d.y0 + d.y; }) })
                    ]).range([h - margin_v, margin_v]);
                    
                    var y_abs = d3.scale.linear().domain([0, 1]).range([h - margin_v, margin_v]);
                    
                    g.selectAll().data(lines).enter().append("svg:path")
                        .attr("d", function(line){
                            return d3.svg.area()
                                .x(function(d) { return x(as_date(d[0])) })
                                .y0(function(d) { return y(d.y0) })
                                .y1(function(d) { return y(d.y0 + d.y) })
                                .defined(compose(not_null, itemgetter(1)))
                                (line.data)
                        })
                        .style("fill", function(line){return line.color})
                        .attr("stroke", function(line){return line.color})
                        .attr("class", "plotline");
                    
                    var total = 0;
                    var total_area = 0;
                    for(var i = 0; i < lines.length; ++i) {
                        var line = lines[i];
                        var stats = get_area_mean(line.data);
                        if(stats.mean != null) {
                            total += stats.mean;
                            total_area += stats.area;
                        }
                    }
                    
                    for(var i = 0; i < lines.length; ++i) {
                        var line = lines[i];
                        var stats = get_area_mean(line.data);
                        if(stats.mean != null) {
                            var num = 0;
                            var denom = 0;
                            for(var j = 0; j < line.data.length; j++)
                                if(line.data[j] != null) {
                                    var d = line.data[j];
                                    num += (d.y+1)*((d.y0 + d.y) + (d.y0))/2;
                                    denom += (d.y+1);
                                }
                            g.append("svg:line")
                                .style("stroke", line.color)
                                .attr("x1", w - margin_h + 3)
                                .attr("y1", y(num/denom))
                                .attr("x2", w - margin_h + 10)
                                .attr("y2", y_abs(i/lines.length));
                            g.append("svg:text")
                                .text(line.label + " (mean: " + d3.format(".3s")(stats.mean) + unit + ")")
                                .attr("text-anchor", "start")
                                .attr("dominant-baseline", "central")
                                .attr("fill", line.color)
                                .attr("x", w - margin_h + 10)
                                .attr("y", y_abs(i/lines.length));
                            if(total_unit != null)
                                g.append("svg:text")
                                    .text("Area: " + d3.format(".3s")(stats.area) + total_unit + " (" + d3.format(".2p")(stats.area/total_area) + " total)")
                                    .attr("text-anchor", "start")
                                    .attr("dominant-baseline", "central")
                                    .attr("fill", line.color)
                                    .attr("x", w - margin_h + 10)
                                    .attr("y", y_abs(i/lines.length) + 12);
                        }
                    }
                    g.append("svg:line")
                        .style("stroke", "black")
                        .attr("x1", w - margin_h + 3)
                        .attr("y1", y(total))
                        .attr("x2", w - margin_h + 10)
                        .attr("y2", y_abs(1));
                    g.append("svg:text")
                        .text("Total (mean: " + d3.format(".3s")(total) + unit + ")")
                        .attr("text-anchor", "start")
                        .attr("dominant-baseline", "central")
                        .attr("fill", "black")
                        .attr("x", w - margin_h + 10)
                        .attr("y", y_abs(1));
                    if(total_unit != null)
                        g.append("svg:text")
                            .text("Area: " + d3.format(".3s")(total_area) + total_unit)
                            .attr("text-anchor", "start")
                            .attr("dominant-baseline", "central")
                            .attr("fill", "black")
                            .attr("x", w - margin_h + 10)
                            .attr("y", y_abs(1) + 12);
                } else {
                    var y = d3.scale.linear().domain([
                        0,
                        d3.max(lines, function(line) { return d3.max(line.data, itemgetter(1)); } )
                    ]).range([h - margin_v, margin_v]);
                    
                    var y_abs = d3.scale.linear().domain([0, 1]).range([h - margin_v, margin_v]);
                    
                    g.selectAll().data(lines).enter().append("svg:path")
                        .attr("d", function(line) {
                            return d3.svg.line()
                                .x(compose(x, as_date, itemgetter(0)))
                                .y(compose(y, itemgetter(1)))
                                .defined(compose(not_null, itemgetter(1)))
                                (line.data)
                        })
                        .style("stroke", function(line) { return line.color })
                        .attr("class", "plotline");
                    
                    lines.sort(function(a, b) { return get_area_mean(a.data).mean > get_area_mean(b.data).mean; });
                    
                    for(var i = 0; i < lines.length; ++i) {
                        var line = lines[i];
                        var stats = get_area_mean(line.data);
                        if(stats.mean != null) {
                            g.append("svg:line")
                                .style("stroke", line.color)
                                .attr("x1", w - margin_h + 3)
                                .attr("y1", y(stats.mean))
                                .attr("x2", w - margin_h + 10)
                                .attr("y2", y_abs(i/lines.length));
                            g.append("svg:text")
                                .text(line.label)
                                .attr("text-anchor", "start")
                                .attr("dominant-baseline", "central")
                                .attr("fill", line.color)
                                .attr("x", w - margin_h + 10)
                                .attr("y", y_abs(i/lines.length) - 12);
                            g.append("svg:text")
                                .text("Mean: " + d3.format(".3s")(stats.mean) + unit)
                                .attr("text-anchor", "start")
                                .attr("dominant-baseline", "central")
                                .attr("fill", line.color)
                                .attr("x", w - margin_h + 10)
                                .attr("y", y_abs(i/lines.length));
                            if(total_unit != null)
                                g.append("svg:text")
                                    .text("Area: " + d3.format(".3s")(stats.area) + total_unit)
                                    .attr("text-anchor", "start")
                                    .attr("dominant-baseline", "central")
                                    .attr("fill", line.color)
                                    .attr("x", w - margin_h + 10)
                                    .attr("y", y_abs(i/lines.length) + 12);
                        }
                    }
                }
                
                // x axis
                
                g.append("svg:line")
                    .attr("x1", margin_h)
                    .attr("y1", h - margin_v)
                    .attr("x2", w - margin_h)
                    .attr("y2", h - margin_v);
                
                g.selectAll()
                    .data(x.ticks(13))
                    .enter().append("svg:g")
                    .attr("transform", function(d) { return "translate(" + x(d) + "," + (h-margin_v/2) + ")"; })
                    .append("svg:text")
                    .attr("transform", "rotate(45)")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "central")
                    .text(x.tickFormat(13));
                
                g.selectAll()
                    .data(x.ticks(13))
                    .enter().append("svg:line")
                    .attr("x1", x)
                    .attr("y1", h - margin_v)
                    .attr("x2", x)
                    .attr("y2", h - margin_v + 5);
                
                // y axis
                
                g.append("svg:line")
                    .attr("x1", margin_h)
                    .attr("y1", h - margin_v)
                    .attr("x2", margin_h)
                    .attr("y2", margin_v);
                
                g.selectAll()
                    .data(y.ticks(6))
                    .enter().append("svg:line")
                    .attr("x1", margin_h - 5)
                    .attr("y1", y)
                    .attr("x2", margin_h)
                    .attr("y2", y);
                
                g.selectAll()
                    .data(y.ticks(6))
                    .enter().append("svg:text")
                    .text(compose(function(x) { return x + unit; }, d3.format(".2s")))
                    .attr("x", margin_h/2)
                    .attr("y", y)
                    .attr("dominant-baseline", "central")
                    .attr("text-anchor", "middle");
            }
            function plot_later(g, unit, total_unit, lines, stack) { // takes lines with url attribute instead of data attribute
                var callbacks_left = lines.length;
                lines.map(function(line) {
                    d3.json(line.url, function(line_data) {
                        line.data = line_data;
                        callbacks_left--;
                        if(callbacks_left == 0)
                            plot(g, unit, total_unit, lines, stack);
                    });
                });
            }
            
            function data_to_lines(data, sort_key) {
                var vers = {}; for(var i = 0; i < data.length; ++i) if(data[i][1] != null) for(var v in data[i][1]) if(data[i][1][v] != data[i][3]) vers[v] = null;
                var verlist = []; for(var v in vers) verlist.push(v);
                verlist.sort();
                
                lines = [];
                for(var i = 0; i < verlist.length; i++) {
                    lines.push({
                        data: data.map(function(d){ return [d[0], d[1] == null ? null : (verlist[i] in d[1] ? d[1][verlist[i]] : d[3]), d[2]] }),
                        color: d3.hsl(i/verlist.length*360, 0.5, 0.5),
                        label: verlist[i]
                    });
                }
                if(sort_key == undefined)
                    var sort_key = function(x) { return d3.max(x.data, function(d){ return d[1] }) }
                lines.sort(function(a, b){ return sort_key(a) - sort_key(b) });
                return lines;
            }
            
            function change_period(period, currency_info) {
                
                d3.select("#period_current").text(period);
                var lowerperiod = period.toLowerCase();
                plot_later(d3.select("#local"), "H/s", "H", [
                    {"url": "../web/graph_data/local_hash_rate/last_" + lowerperiod, "color": "#0000FF", "label": "Total"},
                    {"url": "../web/graph_data/local_dead_hash_rate/last_" + lowerperiod, "color": "#FF0000", "label": "Dead"}
                ]);
                d3.json("../web/graph_data/local_share_hash_rates/last_" + lowerperiod, function(data) {
                    plot(d3.select('#local_shares'), 'H/s', 'H', data_to_lines(data), true);
                });
                plot_later(d3.select("#payout"), currency_info.symbol, null, [
                    {"url": "../web/graph_data/current_payout/last_" + lowerperiod, "color": "#0000FF"}
                ]);
                d3.json("../web/graph_data/pool_rates/last_" + lowerperiod, function(data) {
                    plot(d3.select('#pool'), 'H/s', 'H', data_to_lines(data), true);
                });
                d3.json("../web/graph_data/peers/last_" + lowerperiod, function(data) {
                    plot(d3.select('#peers'), '', null, data_to_lines(data, function(line){ return line.label == "incoming" }), true);
                });
                
                d3.json("../web/graph_data/miner_hash_rates/last_" + lowerperiod, function(data) {
                    d3.json("../web/graph_data/miner_dead_hash_rates/last_" + lowerperiod, function(dead_data) {
                        d3.json("../web/graph_data/current_payouts/last_" + lowerperiod, function(current_payouts) {
                            var users = {}; for(var i = 0; i < data.length; ++i) for(var u in data[i][1]) users[u] = null; for(var i = 0; i < dead_data.length; ++i) for(var u in dead_data[i][1]) users[u] = null;
                            var userlist = []; for(var u in users) userlist.push(u);
                            userlist.sort();
                            d3.select("#miners").selectAll("*").remove();
                            var div = d3.select("#miners").selectAll().data(userlist).enter().append("div");
                            div.append("h3").text(function(u) { return u });
                            div.append("svg:svg").each(function(u) {
                                plot(d3.select(this), "H/s", "H", [
                                    {"data": data.map(function(d){ return [d[0], u in d[1] ? d[1][u] : d[3], d[2]] }), "color": "#0000FF", "label": "Total"},
                                    {"data": dead_data.map(function(d){ return [d[0], u in d[1] ? d[1][u] : d[3], d[2]] }), "color": "#FF0000", "label": "Dead"}
                                ]);
                            });
                            div.append("svg:svg").each(function(u) {
                                plot(d3.select(this), currency_info.symbol, null, [
                                    {"data": current_payouts.map(function(d){ return [d[0], u in d[1] ? d[1][u] : d[3], d[2]] }), "color": "#0000FF"}
                                ]);
                            });
                        });
                    });
                });
                
                d3.json("../web/graph_data/desired_version_rates/last_" + lowerperiod, function(data) {
                    plot(d3.select('#desired_version_rates'), 'H/s', 'H', data_to_lines(data, function(line){ return parseInt(line.label) }), true);
                });
                
                d3.json("../web/graph_data/traffic_rate/last_" + lowerperiod, function(data) {
                    plot(d3.select('#traffic_rate'), 'B/s', 'B', data_to_lines(data, function(line){ return parseInt(line.label) }), true);
                });
                
                plot_later(d3.select("#getwork_latency"), "s", null, [
                    {"url": "../web/graph_data/getwork_latency/last_" + lowerperiod, "color": "#FF0000", "label": "Getwork Latency"}
                ], false);
                
                plot_later(d3.select("#memory_usage"), "B", null, [
                    {"url": "../web/graph_data/memory_usage/last_" + lowerperiod, "color": "#FF0000", "label": "Memory Usage"}
                ], false);
               
            }
            
            d3.json('../local_stats', function(local_stats) {
                d3.select('#warnings').selectAll().data(local_stats.warnings).enter().append('p')
                    .text(function(w){ return 'Warning: ' + w })
                    .attr('style', 'color:red;border:1px solid red;padding:5px');
            })
            
            periods = ["Hour", "Day", "Week", "Month", "Year"];
            d3.select("#period_chooser").selectAll().data(periods).enter().append("button").append("a")
                .text(function(period) { return period })
                .attr('href', function(period){ return "?" + period })
                .attr("style", function(d, i) { return (i == 0 ? "" : "margin-left:.4em;") + "color:blue;text-decoration:underline;cursor:pointer" });
            period = window.location.search.substr(1);
            if(period.length < 3) {
                window.location.search = "Day";
            } else {
                d3.json('../web/currency_info', function(currency_info) {
                    change_period(period, currency_info);
                    setInterval(function(){
                        $('.box div:gt(-1)').remove();

                    change_period(period, currency_info); 
                    
                    
                    $('.active').remove();
                },2500);
                });
            }