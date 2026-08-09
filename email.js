emailjs.init({
    publicKey: "xeTPCgSK8mgwHugHW"
});

function sendReservation(day, dateType) {

    return emailjs.send(

        "service_7gdn8hj",

        "template_7sdc56n",

        {

            selected_date: day,

            date_type: dateType,

            selected_time: "After 20:00"

        }

    );

}
