achievements（成就表）
包含字段：id、name、description、icon、type、requirement_value、points、created_at。

admins（管理员表）
包含字段：id、username、password、role、createdAt、lastLoginAt、updatedAt。

表名：comments (评论表)
包含字段：

id

text

likes

createdAt

userId

contentId

表名：content (内容表)
包含字段：

title

is_bot

type

text

modelTag

provider

deceptionRate

explanation

createdAt

updatedAt

authorId

id

url

totalVotes

aiVotes

humanVotes

correctVotes


表名：contents (内容表)
包含字段：

id

type

url

text

title

isAi

modelTag

provider

deceptionRate

explanation

createdAt

updatedAt

authorId

表名：judgments (判定/记录表)
包含字段：

id

user_choice

is_correct

guest_id

created_at

user_id

content_id


表名：leaderboard (排行榜表)
包含字段：

id

modelName

company

type

deceptionRate

totalTests

createdAt

updatedAt

表名：uploaded_files (已上传文件表)
包含字段：

id

key

url

filename

content_type

size

reference_count

uploaded_at

表名：user_achievements (用户成就关联表)
包含字段：

id

unlocked_at

user_id

achievement_id

表名：users (用户主表)
包含字段：

id

nickname

uid

level

avatar

accuracy (准确率)

totalJudged (总判断数)

streak (当前连胜)

createdAt

updatedAt

maxStreak (最高连胜)

totalBotsBusted (总计识破机器人次数)

weeklyAccuracy (周准确率)

weeklyJudged (周判断数)

weeklyCorrect (周正确数)

lastWeekReset (上周重置时间)

avatarUpdateTime (头像更新时间)

gender (性别)

city (城市)