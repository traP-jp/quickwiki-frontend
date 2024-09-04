const getPassedTime = (update: string) =>{
  const now = new Date();
  console.log(update)
  console.log(now)
  const updateDate = update.split("T")
  console.log(updateDate[0])
  const updateDates = updateDate[0].split("-")
  const updateTimes = updateDate[1].split(":")
  updateTimes[2] = updateTimes[2].slice(0,2)
  const updatedAt = new Date(Number(updateDates[0]), Number(updateDates[1]) - 1, Number(updateDates[2]), Number(updateTimes[0]), Number(updateTimes[1]), Number(updateTimes[2]));
  const diffDate = new Date()
  console.log(diffDate.toLocaleDateString('ja-JP'))
  console.log(updatedAt.toLocaleDateString('ja-JP'), now.getFullYear() - updatedAt.getFullYear())
  diffDate.setFullYear(now.getFullYear() - updatedAt.getFullYear());
  console.log(diffDate.toLocaleDateString('ja-JP'), now.getMonth() - updatedAt.getMonth())
  diffDate.setMonth(now.getMonth() - updatedAt.getMonth());
  console.log(diffDate.toLocaleDateString('ja-JP'), now.getDate() - updatedAt.getDate())
  diffDate.setDate(now.getDate() - updatedAt.getDate());
  console.log(diffDate.toLocaleDateString('ja-JP'), now.getHours() - updatedAt.getHours())
  diffDate.setHours(now.getHours() - updatedAt.getHours());
  console.log(diffDate.toLocaleDateString('ja-JP'), now.getMinutes() - updatedAt.getMinutes())
  diffDate.setMinutes(now.getMinutes() - updatedAt.getMinutes());
  console.log(diffDate.toLocaleDateString('ja-JP'), now.getSeconds() - updatedAt.getSeconds(), now.getSeconds(), updatedAt.getSeconds())
  diffDate.setSeconds(now.getSeconds() - updatedAt.getSeconds());
  console.log(diffDate.toLocaleDateString('ja-JP'),diffDate.getFullYear()
  ,diffDate.getMonth(),
  diffDate.getDate(),
  diffDate.getHours(),
  diffDate.getMinutes(),
  diffDate.getSeconds())
  const month = diffDate.getFullYear() * 12 + diffDate.getMonth() +  Math.floor(diffDate.getDate()/30);
  const year = Math.floor(month / 12)
  const seconds = Math.floor((now.getTime() - updatedAt.getTime()) / 1000)
  const minute = Math.floor(seconds / 60)
  const hour = Math.floor(minute / 60)
  const date = Math.floor(hour / 24 );
  console.log(year, month, date, hour, minute, seconds)
  if(year > 0){
    return {year: year.toString(), card: updateDate[0].replace("-", "年").replace("-", "月") + "日"};
//   }else if(month > 0){
//     return (month % 12).toString() + "ヶ月前"
  }else if(date > 0){
    return {year: "", card: updateDate[0].replace("-", "年").replace("-", "月") + "日"}
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