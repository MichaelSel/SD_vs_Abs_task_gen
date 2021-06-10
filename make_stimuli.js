const EDO = require("edo.js").EDO
let edo = new EDO(12)
const mod = (n, m) => {
    return ((n % m) + m) % m;
}
const JS = function (thing) {
    return JSON.stringify(thing).replace(/"/g,'')
}

const CJS = function (thing) {
    console.log(JS(thing))
}
const rand_int_in_range = function (min,max) {
    return Math.floor(Math.random() * (max - min +1)) + min
}

const rand_int_in_range_but_not_zero = function (min,max) {
    let val = Math.floor(Math.random() * (max - min +1)) + min
    while(val==0) val = Math.floor(Math.random() * (max - min +1)) + min
    return val
}
const unique_in_array = (list) => {

    let unique  = new Set(list.map(JSON.stringify));
    unique = Array.from(unique).map(JSON.parse);

    return unique
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const control = [
    {
        semitones:2,
        pentatonic: [[1,2],[2,3],[4,5]],
        diatonic: [[1,2],[2,3],[4,5],[5,6],[6,7]],
    },
    {
        semitones:4,
        pentatonic: [[1,3]],
        diatonic: [[1,3],[4,6],[5,7]]
    }]

const manipulations = [
    {
        semitones:3,
        pentatonic: [[3,4],[5,6]],
        diatonic: [[2,4],[3,5],[6,8]]
    },

    {
        semitones:5,
        pentatonic: [[2,4],[3,5],[4,6],[5,7]],
        diatonic: [[1,4],[2,5],[3,6],[5,8],[6,9],[7,10]]
    }
]

const make_stimuli = function (subject_id,Qs_per_transmode=8,num_of_transmodes=6,control_per_transmode=2) {


    //Mode array
    let dia_modes = shuffle(Array.from(Array(num_of_transmodes)).map((el,i)=>i%7))
    let penta_modes = shuffle(Array.from(Array(num_of_transmodes)).map((el,i)=>i%5))

    //manipulation array
    let manips = []
    while(manips.length<Qs_per_transmode*num_of_transmodes) manips.push(...shuffle(Array.from(Array(manipulations.length).keys())))

    //Transposition array
    let dia_transpositions = shuffle(Array.from(Array(num_of_transmodes)).map((el,i)=>(i%7)-3))  //-3 through +3
    let penta_transpositions = shuffle(Array.from(Array(num_of_transmodes)).map((el,i)=>(i%7)-3))  //-3 through +3



    let all_dia = []
    let all_penta = []


    for (let i = 0; i < num_of_transmodes; i++) {

        let dia_mode = dia_modes.shift()
        let penta_mode = penta_modes.shift()
        let dia_trans = dia_transpositions.shift()
        let penta_trans = penta_transpositions.shift()
        let dia = edo.scale([0, 2, 4, 5, 7, 9, 11]).mode(dia_mode).pitches
        let penta = edo.scale([0, 2, 4, 5, 7, 9, 11]).mode(penta_mode).pitches

        let diatonic_Qs = {
            subject_id:subject_id,
            set:[0,2,4,5,7,9,11],
            mode: dia_mode,
            in_mode: dia,
            type: "diatonic",
            transposition:dia_trans,
            transposed_in_mode: dia.map(note=>note+dia_trans),
            Q:[]
        }
        let pentatonic_Qs = {
            subject_id:subject_id,
            set:[0,2,4,7,9],
            mode: penta_mode,
            in_mode: penta,
            type: "pentatonic",
            transposition:penta_trans,
            transposed_in_mode: penta.map(note=>note+penta_trans),
            Q:[]
        }






        for (let j = 0; j < Qs_per_transmode; j++) {
            let manipulation_both = manipulations[manips.shift()]

            let dia_manip = manipulation_both.diatonic[rand_int_in_range(0,manipulation_both.diatonic.length-1)]
            let penta_manip = manipulation_both.diatonic[rand_int_in_range(0,manipulation_both.pentatonic.length-1)]


            let dia_delta = dia_manip[1]-dia_manip[0]
            let penta_delta = penta_manip[1]-penta_manip[0]

            let dia_manip_in_mode = [dia_manip[0]-dia_mode,(dia_manip[0]-dia_mode)+dia_delta]
            let penta_manip_in_mode = [penta_manip[0]-penta_mode,(penta_manip[0]-penta_mode)+penta_delta]

            if(dia_manip_in_mode[0]<1) dia_manip_in_mode = dia_manip_in_mode.map(el=>el+7)
            if(penta_manip_in_mode[0]<1) penta_manip_in_mode = penta_manip_in_mode.map(el=>el+5)



            diatonic_Qs.Q.push({
                semitones: manipulation_both.semitones,
                reference_SD: dia_manip_in_mode[0],
                test_SD: dia_manip_in_mode[1],
                reference_note: diatonic_Qs.transposed_in_mode[(dia_manip_in_mode[0]-1)%dia.length],
                test_note: diatonic_Qs.transposed_in_mode[(dia_manip_in_mode[1]-1)%dia.length],
                control:false
            })

            pentatonic_Qs.Q.push({
                semitones: manipulation_both.semitones,
                reference_SD: penta_manip_in_mode[0],
                test_SD: penta_manip_in_mode[1],
                reference_note: pentatonic_Qs.transposed_in_mode[(penta_manip_in_mode[0]-1)%penta.length],
                test_note: pentatonic_Qs.transposed_in_mode[(penta_manip_in_mode[1]-1)%penta.length],
                control:false
            })
        }

        for (let j = 0; j < control_per_transmode; j++) {
            let manipulation_both = control[rand_int_in_range(0,control.length-1)]

            let dia_manip = manipulation_both.diatonic[rand_int_in_range(0,manipulation_both.diatonic.length-1)]
            let penta_manip = manipulation_both.diatonic[rand_int_in_range(0,manipulation_both.pentatonic.length-1)]


            let dia_delta = dia_manip[1]-dia_manip[0]
            let penta_delta = penta_manip[1]-penta_manip[0]

            let dia_manip_in_mode = [dia_manip[0]-dia_mode,(dia_manip[0]-dia_mode)+dia_delta]
            let penta_manip_in_mode = [penta_manip[0]-penta_mode,(penta_manip[0]-penta_mode)+penta_delta]

            if(dia_manip_in_mode[0]<1) dia_manip_in_mode = dia_manip_in_mode.map(el=>el+7)
            if(penta_manip_in_mode[0]<1) penta_manip_in_mode = penta_manip_in_mode.map(el=>el+5)

            diatonic_Qs.Q.push({
                semitones: manipulation_both.semitones,
                reference_SD: dia_manip_in_mode[0],
                test_SD: dia_manip_in_mode[1],
                reference_note: diatonic_Qs.transposed_in_mode[(dia_manip_in_mode[0]-1)%dia.length],
                test_note: diatonic_Qs.transposed_in_mode[(dia_manip_in_mode[1]-1)%dia.length],
                control:true
            })

            pentatonic_Qs.Q.push({
                semitones: manipulation_both.semitones,
                reference_SD: penta_manip_in_mode[0],
                test_SD: penta_manip_in_mode[1],
                reference_note: pentatonic_Qs.transposed_in_mode[(penta_manip_in_mode[0]-1)%penta.length],
                test_note: pentatonic_Qs.transposed_in_mode[(penta_manip_in_mode[1]-1)%penta.length],
                control:true
            })

        }
        diatonic_Qs.Q = shuffle(diatonic_Qs.Q)
        pentatonic_Qs.Q = shuffle(pentatonic_Qs.Q)
        all_dia.push(diatonic_Qs)
        all_penta.push(pentatonic_Qs)
    }


    let all_Qs = []
    if(Math.round(Math.random())==1) all_Qs.push(...all_dia,...all_penta)
    else all_Qs.push(...all_penta,...all_dia)

    return all_Qs
}

let a = make_stimuli("test")

module.exports = make_stimuli


