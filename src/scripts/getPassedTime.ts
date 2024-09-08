const getPassedTime = (update: string) =>{
  const now = new Date();
  const re = /.*年.*月.*日.*/
  let updatedAt = new Date()
  if (re.test(update)){
    const year = Number(update.split("年")[0])
    const month = Number(update.split("年")[1].split("月")[0])
    const date = Number(update.split("月")[1].split("日")[0])
    const hour = Number(update.split(" ")[1].split(":")[0])
    const second = Number(update.split(":")[1])
    updatedAt = new Date(year, month - 1, date, hour, second)
  }else{
    const updateDate = update.split("T")
    const updateDates = updateDate[0].split("-")
    const updateTimes = updateDate[1].split(":")
    updateTimes[2] = updateTimes[2].slice(0,2)
    updatedAt = new Date(Number(updateDates[0]), Number(updateDates[1]) - 1, Number(updateDates[2]), Number(updateTimes[0]), Number(updateTimes[1]), Number(updateTimes[2]));
  }
  const diffDate = new Date()
  diffDate.setFullYear(now.getFullYear() - updatedAt.getFullYear());
  diffDate.setMonth(now.getMonth() - updatedAt.getMonth());
  diffDate.setDate(now.getDate() - updatedAt.getDate());
  diffDate.setHours(now.getHours() - updatedAt.getHours());
  diffDate.setMinutes(now.getMinutes() - updatedAt.getMinutes());
  diffDate.setSeconds(now.getSeconds() - updatedAt.getSeconds());
  const month = diffDate.getFullYear() * 12 + diffDate.getMonth() +  Math.floor(diffDate.getDate()/30);
  const year = Math.floor(month / 12)
  const seconds = Math.floor((now.getTime() - updatedAt.getTime()) / 1000)
  const minute = Math.floor(seconds / 60)
  const hour = Math.floor(minute / 60)
  const date = Math.floor(hour / 24 );
  // console.log(year, month, date, hour, minute, seconds)
  if(year > 0){
    return {year: year.toString(), card: year.toString() + "年前"};
  }else if(month > 0){
    return {year: "", card: (month % 12).toString() + "ヶ月前"};
  }else if(date > 0){
    return {year: "", card: (date % 24).toString() + "日前"}
  }else if(hour > 0){
    return {year: "", card: (hour % 24).toString() + "時間前"}
  }else if(minute > 0){
    return {year: "", card: (minute % 60).toString() + "分前"}
  }else if(seconds >= 0){
    return {year: "", card: (seconds % 60).toString() + "秒前"}
  }else{
    return {year: "", card: "error"}
  }
}

export default getPassedTime;