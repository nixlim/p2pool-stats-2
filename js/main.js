// based on goblin's p2pool-stats project
var nIntervId = null;

var gaugeEfficiency;

//ATTEMPTING UNIVERSAL UPDATER
//  function getData(locName, callData) {
//                     var locName = locName;
//                     var callData = callData;
//                     nIntervId = setInterval(function(locName,callData){
//                         console.log(locName);
//                         console.log(callData);
//                         var url = "../"+locName;
//                         d3.json(url, function(locName) {
//                         //console.log('tick'); //DEBUGGER
//                         // var local = d3.sum(values(local_stats.miner_hash_rates));
//                         // d3.select('#local_rate').text(d3.format('.3s')(local) + 'H/s');
//                         eval(callData);
//                                         });
//                     },
//                         2500); //SET UPDATE TIME HERE - 1s=500
//                     }
// getData("local_stats", "d3.select('#local_rate').text(d3.format('.3s')(local) + 'H/s');"); 
//             // setTimeout(function(){
//             //         window.location.reload(1);
//             //         }, 5000);     
                 
//CURRENT UPDATERS

//Global Pool
// function getGlobal() {
//                     nIntervId = setInterval(function(){
//                         d3.json('../global_stats', function(global_stats) {
//                         //console.log('tick'); //DEBUGGER
//                         d3.select('#pool_rate').text(d3.format('.3s')(global_stats.pool_hash_rate) + 'H/s');
//                                         });
//                     },
//                         2500); //SET UPDATE TIME HERE - 1s=500
//                     }
                                       
//                     getGlobal();
//d3.select('#pool_rate').text(d3.format('.3s')(global_stats.pool_hash_rate) + 'H/s');

//RUN DYNAMIC UPDATE ON LOCAL RATE
                // function getLocal() {
                //     nIntervId = setInterval(function(){
                //         d3.json('../local_stats', function(local_stats) {
                //         //console.log('tick'); //DEBUGGER
                //         var local = d3.sum(values(local_stats.miner_hash_rates));
                //         d3.select('#local_rate').text(d3.format('.3s')(local) + 'H/s');
                //                         });
                //     },
                //         2500); //SET UPDATE TIME HERE - 1s=500
                //     }
                                       
                // getLocal();
                //d3.select('#local_rate').text(d3.format('.3s')(local) + 'H/s');
                //END OF LOCAL RATE UPDATE

// DYNAMIC UPDATING (DU) - UPTIME
                // function getUptime() {
                //     nIntervId = setInterval(function(){
                //         d3.json('../local_stats', function(local_stats) {
                //         //console.log('tick'); //DEBUGGER
                //         d3.select('#uptime').text(format_dt(local_stats.uptime));
                //                         });
                //     },
                //         2500); //SET UPDATE TIME HERE - 1s=500
                //     }
                                       
                // getUptime();
                //d3.select('#uptime').text(format_dt(local_stats.uptime)); //important - avoid initial delay on load
                // END - DU - UPTIME



            function format_dt(dt) {
                var pairs = [
                    [365.2425*60*60*24, 'years'],
                    [60*60*24, 'days'],
                    [60*60, 'hours'],
                    [60, 'minutes'],
                    [1, 'seconds'],
                ];
                
                for(var i in pairs) {
                    var value = pairs[i][0];
                    var name = pairs[i][1];
                    
                    if(dt > value) break;
                }
                
                return d3.format('.1f')(dt/value) + ' ' + name;
            }
            
            function values(o){ res = []; for(var x in o) res.push(o[x]); return res; }
            
            d3.json('../local_stats', function(local_stats) {
                function getUpdateLocal() {
                    nIntervId = setInterval(function(){
                    d3.json('../local_stats', function(local_stats) {
                        d3.select('#peers_in').text(local_stats.peers.incoming);
                        d3.select('#peers_out').text(local_stats.peers.outgoing);
                        var local = d3.sum(values(local_stats.miner_hash_rates));
                        var local_dead = d3.sum(values(local_stats.miner_dead_hash_rates));
                        d3.select('#local_rate').text(d3.format('.3s')(local) + 'H/s');
                        d3.select('#local_doa').text(d3.format('.2p')(local_dead/local));
                        d3.select('#shares_total').text(local_stats.shares.total);
                        d3.select('#shares_orphan').text(local_stats.shares.orphan);
                        d3.select('#shares_dead').text(local_stats.shares.dead);
                        d3.select('#efficiency').text(local_stats.efficiency != null ? d3.format('.4p')(local_stats.efficiency) : '???')
                        d3.select('#uptime').text(format_dt(local_stats.uptime)); //important - avoid initial delay on load
                        d3.select('#block_value').text(local_stats.block_value);
                        d3.select('#warnings').selectAll().data(local_stats.warnings).enter().append('p')
                            .text(function(w){ return 'Warning: ' + w })
                            .attr('style', 'color:red;border:1px solid red;padding:5px');
                        var time_to_share = local_stats.attempts_to_share/local;
                        d3.select('#time_to_share').text(format_dt(time_to_share));
                    });
                    }, 
                        2500);
                }
                getUpdateLocal();
                d3.select('#peers_in').text(local_stats.peers.incoming);
                d3.select('#peers_out').text(local_stats.peers.outgoing);
                var local = d3.sum(values(local_stats.miner_hash_rates));
                var local_dead = d3.sum(values(local_stats.miner_dead_hash_rates));
                d3.select('#local_rate').text(d3.format('.3s')(local) + 'H/s');
                d3.select('#local_doa').text(d3.format('.2p')(local_dead/local));
                d3.select('#shares_total').text(local_stats.shares.total);
                d3.select('#shares_orphan').text(local_stats.shares.orphan);
                d3.select('#shares_dead').text(local_stats.shares.dead);
                d3.select('#efficiency').text(local_stats.efficiency != null ? d3.format('.4p')(local_stats.efficiency) : '???')



                d3.select('#uptime').text(format_dt(local_stats.uptime)); //important - avoid initial delay on load
                d3.select('#block_value').text(local_stats.block_value);
                d3.select('#warnings').selectAll().data(local_stats.warnings).enter().append('p')
                    .text(function(w){ return 'Warning: ' + w })
                    .attr('style', 'color:red;border:1px solid red;padding:5px');
                
                var time_to_share = local_stats.attempts_to_share/local;
                d3.select('#time_to_share').text(format_dt(time_to_share));
                

                d3.json('../global_stats', function(global_stats) {

                    //RUN DYNAMIC UPDATE ON POOL RATE
                    
                    function getGlobal() {
                    nIntervId = setInterval(function(){
                        d3.json('../global_stats', function(global_stats) {
                        //console.log('tick'); //DEBUGGER
                        d3.select('#pool_rate').text(d3.format('.3s')(global_stats.pool_hash_rate) + 'H/s');
                                        });
                    },
                        2500); //SET UPDATE TIME HERE - 1s=500
                    }
                                       
                    getGlobal();
                    d3.select('#pool_rate').text(d3.format('.3s')(global_stats.pool_hash_rate) + 'H/s');

                    //END DYNAMIC UPDATE ON POOL RATE

                    d3.select('#pool_stale').text(d3.format('.2p')(global_stats.pool_stale_prop));
                    d3.select('#difficulty').text(d3.format('.3r')(global_stats.min_difficulty));
                    
                    var time_to_block = local_stats.attempts_to_block/global_stats.pool_hash_rate;
                    d3.select('#time_to_block').text(format_dt(time_to_block));
                    
                    d3.select('#expected_payout_amount').text(d3.format('.3r')(local/global_stats.pool_hash_rate*local_stats.block_value*(1-local_stats.donation_proportion)));
                });
            });
            
            d3.json('../web/version', function(version) {
                d3.selectAll('#version').text(version);
            });
            
            d3.json('../web/currency_info', function(currency_info) {
                d3.selectAll('.symbol').text(currency_info.symbol);
                
                d3.json('../current_payouts', function(pays) {
                    d3.json('../payout_addr', function(addr) {
                        d3.select('#payout_addr').text(addr).attr('href', currency_info.address_explorer_url_prefix + addr);
                        d3.select('#payout_amount').text(addr in pays ? pays[addr] : 0);
                    });
                    
                    var arr = []; for(var i in pays) arr.push(i); arr.sort(function(a, b){return pays[b] - pays[a]});
                    
                    var tr = d3.select('#payouts').selectAll().data(arr).enter().append('tr');
                    tr.className = tr.className + " flex-item";
                    tr.append('td').append('a').text(function(addr){return addr}).attr('href', function(addr){return currency_info.address_explorer_url_prefix + addr});
                    tr.append('td').text(function(addr){return pays[addr]});
                    
                    var total_tr = d3.select('#payouts').append('tr');
                    total_tr.className = total_tr.className + " flex-item";
                    total_tr.append('td').append('strong').text('Total');
                    total_tr.append('td').text(d3.sum(arr, function(addr){return pays[addr]}).toFixed(8));
                });
                
                d3.json('../recent_blocks', function(blocks) {
                    var tr = d3.select('#blocks').selectAll().data(blocks).enter().append('tr');
                    tr.className = tr.className + " flex-item";
                    tr.append('td').text(function(block){return new Date(1000*block.ts).toString()});
                    tr.append('td').text(function(block){return block.number});
                    tr.append('td').append('a').text(function(block){return block.hash}).attr('href', function(block){return currency_info.block_explorer_url_prefix + block.hash});
                    tr.append('td').append('a').text('→').attr('href', function(block){return 'share.html#' + block.share});
                });
            });
            
            d3.json('../web/best_share_hash', function(c) {
                d3.select('#best_share').append('a').attr('href', 'share.html#' + c).text(c.substr(-8));
            });
            
            function fill(url, id) {
                d3.json(url, function(d) {
                    d.sort()
                    d3.select(id).selectAll().data(d).enter().append('span').text(' ').append('a').attr('href', function(c){return 'share.html#' + c}).text(function(c){return c.substr(-8)});
                });
            }

            
            fill('../web/verified_heads', '#verified_heads');
            fill('../web/heads', '#heads');
            fill('../web/verified_tails', '#verified_tails');
            fill('../web/tails', '#tails');
            fill('../web/my_share_hashes', '#my_share_hashes');

             
                           function stopTextColor() {
  clearInterval(nIntervId);
}

var valueGauge = $('#gaugeContainer').jqxGauge('value');
$('#gaugeContainer').jqxGauge({ width: '150px', height: '150px', radius: '50%' });
// $('#gaugeContainer').jqxGauge({ border: {visible: false }});
$('#gaugeContainer').jqxGauge({
    ranges: [{ startValue: 0, endValue: 50, style: { fill: '#FC6A6A', stroke: '#FC6A6A' }, endWidth: 5, startWidth: 1 },
                { startValue: 50, endValue: 95, style: { fill: '#FCA76A', stroke: '#FCA76A' }, endWidth: 9, startWidth: 5 },
                { startValue: 95, endValue: 150, style: { fill: 'green', stroke: 'green' }, endWidth: 15, startWidth: 9}],
    ticksMinor: { interval: 5, size: '5%' },
    ticksMajor: { interval: 10, size: '9%' },
    border: {
        visible: true,
        style: { fill: '#cccccc', stroke: '#cccccc' },
        showGradient: true
         },
    value: 0,
    max: 150,
    caption: { value: 'Efficiency (%)', position: 'bottom', offset: [0, 0], visible: true },
    colorScheme: 'scheme03',
    animationDuration: 1200
});

function efficiencyUpdate() {
                    nIntervId = setInterval(function(){
d3.json('../local_stats', function(local_stats) {
        gaugeEfficiency = d3.format('.4g')(100 * local_stats.efficiency);

        $('#gaugeContainer').jqxGauge({
            value: gaugeEfficiency
                });
});
 },
                        2500); //SET UPDATE TIME HERE - 1s=500
                    }
d3.json('../local_stats', function(local_stats) {
        gaugeEfficiency = d3.format('.4g')(100 * local_stats.efficiency);

        $('#gaugeContainer').jqxGauge({
            value: gaugeEfficiency
                });
});

efficiencyUpdate();

$(document).ready(function () {
        // Create jqxNavigationBar
        $("#jqxnavigationbar").jqxNavigationBar({ width: 400, height: 400, theme: 'theme02', expandMode: 'multiple', expandedIndexes: []});
        //replace arrow down with custom i
        $(".jqx-expander-arrow").addClass("typcn typcn-info-large-outline");
        
    });

